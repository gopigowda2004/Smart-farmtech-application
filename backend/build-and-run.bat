@echo off
cd /d "%~dp0"
echo Building backend...
call mvnw.cmd clean package -DskipTests
if %errorlevel% neq 0 (
    echo Build failed with error code %errorlevel%
    pause
    exit /b %errorlevel%
)
echo.
echo Build complete! Starting backend...
echo.
java -jar target\backend-*.jar
