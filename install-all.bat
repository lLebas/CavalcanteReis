@echo off
chcp 65001 >nul
echo ========================================
echo   Instalando todas as dependencias
echo ========================================
echo.

echo [1/3] Instalando dependencias do monorepo...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do monorepo
    pause
    exit /b 1
)
echo OK!

echo.
echo [2/3] Instalando dependencias do backend...
if not exist "backend" (
    echo ERRO: Pasta backend nao encontrada!
    pause
    exit /b 1
)
cd backend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo OK!

echo.
echo [3/3] Instalando dependencias do frontend...
if not exist "frontend" (
    echo ERRO: Pasta frontend nao encontrada!
    pause
    exit /b 1
)
cd frontend
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo OK!

echo.
echo ========================================
echo   Instalacao concluida com sucesso!
echo ========================================
echo.
echo Agora voce pode rodar: npm run dev
echo.
pause

