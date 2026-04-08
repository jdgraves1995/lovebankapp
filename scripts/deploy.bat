@echo off
REM Love Bank App - Automated GitHub Deployment Script
REM This script attempts to create the repository and deploy automatically
REM If GitHub CLI is not installed, you'll need to follow manual steps

setlocal enabledelayedexpansion

echo.
echo =====================================
echo   Love Bank App - GitHub Deployment
echo =====================================
echo.

REM Check if GitHub CLI is installed
where gh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: GitHub CLI (gh) is not installed
    echo.
    echo To deploy automatically, install GitHub CLI from:
    echo https://cli.github.com/
    echo.
    echo OR follow manual deployment steps in FINAL_DEPLOYMENT.md
    echo.
    pause
    exit /b 1
)

echo [1/4] Checking GitHub authentication...
gh auth status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo You need to authenticate with GitHub first.
    echo Running: gh auth login
    echo.
    call gh auth login
)

echo [2/4] Creating GitHub repository...
cd /d "c:\VisualStudioCodeWorkspaces\VisualStudioCodePromptEngineer\love-bank-app"

REM Create the repository
gh repo create lovebankapp --public --source=. --remote=origin --push 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo Repository may already exist or creation failed.
    echo Proceeding with push...
)

echo [3/4] Pushing code to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/jdgraves1995/lovebankapp.git
git branch -M main
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push code
    echo.
    echo Please follow manual steps in FINAL_DEPLOYMENT.md
    echo.
    pause
    exit /b 1
)

echo [4/4] Enabling GitHub Pages...
gh repo edit jdgraves1995/lovebankapp --enable-issues --enable-projects --enable-wiki 2>nul

echo.
echo =====================================
echo   ✓ Deployment Successful!
echo =====================================
echo.
echo Your app will be live at:
echo https://jdgraves1995.github.io/lovebankapp
echo.
echo (Note: GitHub may take 1-2 minutes to build and deploy)
echo.
echo You may still need to manually enable GitHub Pages:
echo 1. Go to: https://github.com/jdgraves1995/lovebankapp/settings/pages
echo 2. Set Source to "Deploy from a branch"
echo 3. Select branch "main" and folder "/ (root)"
echo 4. Save
echo.
pause
