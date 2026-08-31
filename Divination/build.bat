@echo off
setlocal
set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe
if not exist "%CSC%" (
  echo [ERROR] csc.exe not found - .NET Framework 4.x required
  pause
  exit /b 1
)
if exist "%~dp0Divination.ico" (
  "%CSC%" /nologo /target:winexe /reference:System.Web.Extensions.dll /win32icon:"%~dp0Divination.ico" /out:"%~dp0Divination.exe" "%~dp0Divination.cs"
) else (
  "%CSC%" /nologo /target:winexe /reference:System.Web.Extensions.dll /out:"%~dp0Divination.exe" "%~dp0Divination.cs"
)
if errorlevel 1 (
  echo BUILD FAILED
  pause
  exit /b 1
)
echo OK: Divination.exe created
pause
