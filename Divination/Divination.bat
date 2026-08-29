@echo off
setlocal
cd /d "%~dp0"

set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if not exist "%CSC%" (
  echo [ERROR] .NET Framework 4.x csc.exe not found
  pause
  exit /b 1
)

if not exist "Divination.cs" (
  echo [ERROR] Divination.cs not found
  pause
  exit /b 1
)

if not exist "Divination.ico" (
  echo [ERROR] Divination.ico not found
  pause
  exit /b 1
)

"%CSC%" /nologo /target:winexe /win32icon:"Divination.ico" /out:Divination.exe "Divination.cs"
if errorlevel 1 (
  echo BUILD FAILED
  pause
  exit /b 1
)

echo OK: Divination.exe created
start "" "Divination.exe"
