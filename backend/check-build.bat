@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
:loop
timeout /t 30 /nobreak
if exist "target\backend-*.jar" (
    echo.
    echo ========================================
    echo BUILD COMPLETE!
    echo ========================================
    dir target\backend-*.jar
    echo Backend is ready to start!
    echo.
    exit /b 0
) else (
    echo Waiting for build to complete... %time%
    goto loop
)
