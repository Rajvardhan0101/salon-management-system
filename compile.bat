@echo off
echo ===============================================================
echo   Compiling Salon Management System (Java + JDBC)
echo ===============================================================

if not exist bin mkdir bin

javac -cp "lib/*" -d bin src\com\salon\model\*.java src\com\salon\db\*.java src\com\salon\dao\*.java src\com\salon\handler\*.java src\com\salon\Main.java

if %errorlevel% equ 0 (
    echo [SUCCESS] All Java source files compiled successfully into bin/
) else (
    echo [ERROR] Compilation failed. Please check error output above.
)
