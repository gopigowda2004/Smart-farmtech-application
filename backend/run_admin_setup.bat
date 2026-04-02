@echo off
setlocal enabledelayedexpansion

set MYSQL_BIN="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set DB_USER=root
set DB_PASS=root
set DB_NAME=farmtech

echo Creating admin account...

%MYSQL_BIN% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "INSERT IGNORE INTO users (email, phone, password, name, full_name, role, address, district, state, pincode) VALUES ('admin@farmtech.com', '8888899999', '123@Gopi', 'Admin', 'System Administrator', 'ADMIN', 'FarmTech HQ, Bangalore', 'Bangalore', 'Karnataka', '560001');"

if %ERRORLEVEL% NEQ 0 (
    echo Error inserting into users table
    pause
    exit /b 1
)

%MYSQL_BIN% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "INSERT IGNORE INTO farmers (name, email, phone, password, address) VALUES ('System Administrator', 'admin@farmtech.com', '8888899999', '123@Gopi', 'FarmTech HQ, Bangalore');"

if %ERRORLEVEL% NEQ 0 (
    echo Error inserting into farmers table
    pause
    exit /b 1
)

echo.
echo Verifying admin account...
%MYSQL_BIN% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT id, email, phone, role FROM users WHERE phone='8888899999';"

echo.
echo Admin account setup completed!
pause
