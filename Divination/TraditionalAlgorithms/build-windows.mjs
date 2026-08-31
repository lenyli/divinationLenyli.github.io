import fs from 'node:fs';
import path from 'node:path';
import { gzipSync, gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { transformSync } from '@babel/core';
import presetEnv from '@babel/preset-env';
import { parse } from '@babel/parser';

const here = path.dirname(fileURLToPath(import.meta.url));
const csharpPath = path.join(here, '..', 'Divination.cs');

const bundled = await esbuild.build({
  entryPoints: [path.join(here, 'adapter.ts')],
  bundle: true,
  format: 'iife',
  globalName: 'ZhanbuAlgorithms',
  platform: 'browser',
  target: ['es2015'],
  minify: false,
  write: false,
  charset: 'utf8',
});

let source = bundled.outputFiles[0].text;
const fnvPattern = /  function hashStableValue\(value\) \{[\s\S]*?\n  \}\n  function normalizeCalculatedAt/;
if (!fnvPattern.test(source)) {
  throw new Error('Unable to locate Mingyu Core hashStableValue for the Windows compatibility build.');
}

// IE11 has no BigInt. This is the same FNV-1a 64-bit hash, represented as two
// unsigned 32-bit halves so the algorithm result identity remains deterministic.
source = source.replace(fnvPattern, `  function hashStableValue(value) {
    var text = stableStringify(value);
    var high = 0xcbf29ce4;
    var low = 0x84222325;
    for (var index = 0; index < text.length; index++) {
      low = (low ^ text.charCodeAt(index)) >>> 0;
      var lowProduct = low * 0x1b3;
      var carry = Math.floor(lowProduct / 0x100000000);
      high = (high * 0x1b3 + low * 0x100 + carry) >>> 0;
      low = lowProduct >>> 0;
    }
    return high.toString(16).padStart(8, "0") + low.toString(16).padStart(8, "0");
  }
  function normalizeCalculatedAt`);

const transformed = transformSync(source, {
  presets: [[presetEnv, { targets: { ie: '11' }, modules: false, bugfixes: true }]],
  sourceType: 'script',
  comments: false,
  compact: true,
});
if (!transformed || !transformed.code) throw new Error('Babel did not produce a Windows algorithm bundle.');

const polyfills = fs.readFileSync(path.join(here, 'node_modules/core-js-bundle/minified.js'), 'utf8');
const output = `${polyfills}\n${transformed.code}\n`;
const ast = parse(transformed.code, { sourceType: 'script' });
let unsupportedSyntax = false;
const seen = new WeakSet();
function visit(value) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if ((value.type === 'VariableDeclaration' && value.kind !== 'var') ||
      value.type === 'ArrowFunctionExpression' || value.type === 'OptionalMemberExpression' ||
      value.type === 'OptionalCallExpression' || value.type === 'BigIntLiteral') {
    unsupportedSyntax = true;
  }
  for (const child of Object.values(value)) {
    if (Array.isArray(child)) child.forEach(visit);
    else visit(child);
  }
}
visit(ast);
if (unsupportedSyntax) {
  throw new Error('Windows algorithm bundle still contains unsupported modern JavaScript syntax.');
}
const compressed = gzipSync(Buffer.from(output, 'utf8'), { level: 9, mtime: 0 });
const encoded = compressed.toString('base64');
if (gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8') !== output) {
  throw new Error('Embedded Windows payload round-trip verification failed.');
}

const chunks = encoded.match(/.{1,8000}/g) || [];
const replacement = `    // WINDOWS_ALGORITHM_PAYLOAD_BEGIN\n` +
  `    internal static readonly string Data = string.Concat(new string[] {\n` +
  chunks.map((chunk) => `        "${chunk}"`).join(',\n') +
  `\n    });\n` +
  `    // WINDOWS_ALGORITHM_PAYLOAD_END`;
const csharp = fs.readFileSync(csharpPath, 'utf8');
const markerPattern = /    \/\/ WINDOWS_ALGORITHM_PAYLOAD_BEGIN[\s\S]*?    \/\/ WINDOWS_ALGORITHM_PAYLOAD_END/;
if (!markerPattern.test(csharp)) {
  throw new Error('Unable to locate the Windows payload markers in Divination.cs.');
}
fs.writeFileSync(csharpPath, csharp.replace(markerPattern, replacement), 'utf8');
console.log(`Windows algorithm payload embedded in Divination.cs (${output.length} bytes, ${compressed.length} compressed bytes)`);
