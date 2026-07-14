@echo off
setlocal
set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe
if not exist "%CSC%" (
  echo [ERROR] csc.exe not found - .NET Framework 4.x required
  pause
  exit /b 1
)
"%CSC%" /nologo /target:winexe /out:Divination.exe "%~dp0Divination.cs"
if errorlevel 1 (
  echo BUILD FAILED
  pause
  exit /b 1
)
echo OK: Divination.exe created
pause
