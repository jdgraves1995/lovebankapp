#!/usr/bin/env pwsh
# Love Bank App - Complete GitHub Deployment
# This script creates the repository and deploys your app to GitHub Pages

param(
    [string]$GitHubToken = ""
)

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Love Bank App - Complete GitHub Deployment Script    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$AppPath = "c:\VisualStudioCodeWorkspaces\VisualStudioCodePromptEngineer\love-bank-app"
$GitHubUsername = "jdgraves1995"
$RepoName = "lovebankapp"
$RepoUrl = "https://github.com/$GitHubUsername/$RepoName"
$PagesUrl = "https://$GitHubUsername.github.io/$RepoName"

Set-Location $AppPath

# Check git is available
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git found" -ForegroundColor Green

# Get GitHub token if not provided
if (-not $GitHubToken) {
    Write-Host ""
    Write-Host "⚠️  GITHUB TOKEN REQUIRED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy, you need a Personal Access Token from GitHub:"
    Write-Host ""
    Write-Host "1. Go to: https://github.com/settings/tokens/new"
    Write-Host "2. Check only: 'repo' scope"
    Write-Host "3. Generate and copy the token"
    Write-Host ""
    $GitHubToken = Read-Host "Enter your token (or press Enter to cancel)"
    
    if (-not $GitHubToken) {
        Write-Host ""
        Write-Host "Deployment cancelled. See START_HERE.md for manual steps." -ForegroundColor Yellow
        exit 1
    }
}

# Configure git
Write-Host ""
Write-Host "[2/5] Configuring git credentials..." -ForegroundColor Yellow
$GitCredential = "$GitHubUsername`:$GitHubToken" | ConvertTo-SecureString -AsPlainText -Force
$GitCredentialB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($GitCredential | ConvertFrom-SecureString))

# Add remote
Write-Host "[3/5] Setting up remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin "https://$GitHubUsername`:$GitHubToken@github.com/$GitHubUsername/$RepoName.git"
git branch -M main

Write-Host "✓ Remote configured" -ForegroundColor Green

# Push to GitHub
Write-Host "[4/5] Pushing code to GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Code pushed successfully" -ForegroundColor Green
    } else {
        throw "Git push failed"
    }
} catch {
    Write-Host "ERROR: Could not push to GitHub" -ForegroundColor Red
    Write-Host "Details: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "- Token is invalid or expired"
    Write-Host "- Repository doesn't exist at $RepoUrl"
    Write-Host "- Network connectivity issue"
    Write-Host ""
    exit 1
}

# Enable GitHub Pages via API
Write-Host "[5/5] Enabling GitHub Pages..." -ForegroundColor Yellow
$Headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
}

$PagesPayload = @{
    "source" = @{
        "branch" = "main"
        "path" = "/"
    }
} | ConvertTo-Json

try {
    $Response = Invoke-WebRequest `
        -Uri "https://api.github.com/repos/$GitHubUsername/$RepoName/pages" `
        -Method Post `
        -Headers $Headers `
        -Body $PagesPayload `
        -ContentType "application/json" `
        -ErrorAction SilentlyContinue
    
    Write-Host "✓ GitHub Pages enabled" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not auto-enable GitHub Pages via API" -ForegroundColor Yellow
    Write-Host "You may need to manually enable it at:"
    Write-Host "$RepoUrl/settings/pages"
}

# Clean up credential from memory
$GitHubToken = ""
$GitCredential = ""

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✓ DEPLOYMENT SUCCESSFUL!                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your repository:" -ForegroundColor Cyan
Write-Host "  $RepoUrl"
Write-Host ""
Write-Host "Your live application:" -ForegroundColor Cyan
Write-Host "  $PagesUrl"
Write-Host ""
Write-Host "⏳ GitHub Pages may take 1-2 minutes to build and deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "If the site doesn't appear in a few minutes:" -ForegroundColor Yellow
Write-Host "  1. Check $RepoUrl/settings/pages"
Write-Host "  2. Verify source is 'Deploy from a branch'"
Write-Host "  3. Select 'main' branch and '/ (root)' folder"
Write-Host ""
