#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 Divination.cs 生成 PWA 与 Swift 的数据表。

Divination.cs 是唯一数据源。改完 cs 后跑一次本脚本，把数据同步到：
  - Divination-PWA/data.js
  - Divination-iOS/Divination/DivinationData.swift
  - Divination-macOS/Divination/DivinationData.swift   （与 iOS 同内容）

用法：
    python3 gen_data.py            # 生成
    python3 gen_data.py --check    # 只校验现有文件是否与 cs 一致，不写入
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CS = ROOT / "Divination.cs"
JS = ROOT / "Divination-PWA" / "data.js"
SWIFTS = [
    ROOT / "Divination-iOS" / "Divination" / "DivinationData.swift",
    ROOT / "Divination-macOS" / "Divination" / "DivinationData.swift",
]

HEADER = "// 数据表：由 Divination.cs 自动转换生成"

# 表名 -> 类型。顺序即输出顺序，与现有文件一致。
TABLES = [
    ("TRI_ELEM", "dict_str"),
    ("HEXAGRAMS", "dict_list"),
    ("POS", "list_str"),
    ("PLANETS", "list_list"),
    ("SIGNS", "list_list"),
    ("HOUSES", "list_list"),
    ("LENORMAND", "list_list"),
    ("RUNES", "list_list"),
    ("QIAN", "list_list"),
    ("TAROT", "list_list"),
    ("YESNO", "list_list"),
    ("DATE12", "list_list"),
]


def strings(text):
    """取出一段 C# 里所有双引号字符串（数据区无转义，直接取）。"""
    return re.findall(r'"([^"]*)"', text)


def table_body(cs, name):
    """截取 `static readonly ... NAME = {` 到配对 `};` 之间的正文。"""
    m = re.search(r"static readonly [^\n]*?\b%s\s*=\s*(new [^{]*)?\{" % re.escape(name), cs)
    if not m:
        raise SystemExit(f"未在 Divination.cs 中找到数据表 {name}")
    i = cs.index("{", m.end() - 1)
    depth = 0
    for j in range(i, len(cs)):
        if cs[j] == "{":
            depth += 1
        elif cs[j] == "}":
            depth -= 1
            if depth == 0:
                return cs[i + 1 : j]
    raise SystemExit(f"数据表 {name} 的花括号未配对")


def parse(cs, name, kind):
    body = table_body(cs, name)
    if kind == "list_str":
        return strings(body)
    if kind == "dict_str":
        # {"k","v"},{"k","v"}...
        return dict(re.findall(r'\{\s*"([^"]*)"\s*,\s*"([^"]*)"\s*\}', body))
    if kind == "dict_list":
        # {"k", new string[]{...}}
        out = {}
        for km in re.finditer(r'\{\s*"([^"]*)"\s*,\s*new string\[\]\s*\{([^}]*)\}', body):
            out[km.group(1)] = strings(km.group(2))
        return out
    if kind == "list_list":
        return [strings(g) for g in re.findall(r"new string\[\]\s*\{([^}]*)\}", body)]
    raise AssertionError(kind)


def j(value):
    """JS/Swift 共用的字面量：JSON 语义，非 ASCII 原样输出。"""
    return json.dumps(value, ensure_ascii=False)


def render_js(data):
    lines = [HEADER]
    for name, kind in TABLES:
        v = data[name]
        if kind == "dict_str":
            inner = ", ".join(f"{j(k)}: {j(x)}" for k, x in v.items())
            lines.append(f"const {name} = {{{inner}}};")
        elif kind == "dict_list":
            inner = ", ".join(f"{j(k)}: [{', '.join(j(x) for x in row)}]" for k, row in v.items())
            lines.append(f"const {name} = {{{inner}}};")
        elif kind == "list_str":
            lines.append(f"const {name} = [{','.join(j(x) for x in v)}];")
        else:
            inner = ", ".join("[" + ", ".join(j(x) for x in row) + "]" for row in v)
            lines.append(f"const {name} = [{inner}];")
    return "\n".join(lines) + "\n"


def render_swift(data):
    lines = [HEADER, "import Foundation", ""]
    for name, kind in TABLES:
        v = data[name]
        if kind == "dict_str":
            lines.append(f"let {name}: [String: String] = [")
            lines += [f"    {j(k)}: {j(x)}," for k, x in v.items()]
            lines[-1] = lines[-1].rstrip(",")
            lines += ["]", ""]
        elif kind == "dict_list":
            lines.append(f"let {name}: [String: [String]] = [")
            lines += [f"    {j(k)}: [{', '.join(j(x) for x in row)}]," for k, row in v.items()]
            lines[-1] = lines[-1].rstrip(",")
            lines += ["]", ""]
        elif kind == "list_str":
            lines += [f"let {name} = [{', '.join(j(x) for x in v)}]", ""]
        else:
            lines.append(f"let {name}: [[String]] = [")
            lines += ["    [" + ", ".join(j(x) for x in row) + "]," for row in v]
            lines[-1] = lines[-1].rstrip(",")
            lines += ["]", ""]
    return "\n".join(lines[:-1]) + "\n"


def check_mojibake(text, label):
    bad = [c for c in text if 0xE000 <= ord(c) <= 0xF8FF or ord(c) == 0xFFFD]
    if bad:
        print(f"  ⚠️  {label}: 残留乱码字符 {len(bad)} 处 "
              f"({', '.join(sorted({hex(ord(c)) for c in bad}))})")
    return len(bad)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="只校验，不写入")
    args = ap.parse_args()

    cs = CS.read_text(encoding="utf-8")
    data = {name: parse(cs, name, kind) for name, kind in TABLES}

    counts = ", ".join(f"{n}={len(data[n])}" for n, _ in TABLES)
    print(f"已解析 Divination.cs：{counts}")

    js_text = render_js(data)
    swift_text = render_swift(data)

    bad = check_mojibake(cs, "Divination.cs")
    if not bad:
        print("  ✅ Divination.cs 无乱码字符")

    targets = [(JS, js_text)] + [(p, swift_text) for p in SWIFTS]

    if args.check:
        ok = True
        for path, want in targets:
            got = path.read_text(encoding="utf-8") if path.exists() else None
            same = got == want
            ok &= same
            print(f"  {'✅' if same else '❌'} {path.relative_to(ROOT)} "
                  f"{'与 cs 一致' if same else '与 cs 不一致，需重新生成'}")
        return 0 if ok else 1

    for path, text in targets:
        path.write_text(text, encoding="utf-8")
        print(f"  已写入 {path.relative_to(ROOT)}（{len(text)} 字符）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
