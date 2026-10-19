@echo off
title Indian Salon Management System Server
echo ===============================================================
echo   Starting Indian Salon Management System (Java Backend)
echo ===============================================================

if not exist bin\com\salon\Main.class (
    echo Compiled binaries not found. Compiling first...
    call compile.bat
)

java -cp "bin;lib/*" com.salon.Main
pause
