# Love Bank App - GitHub Push Script
# This script will push your app to GitHub after you create the repository

Write-Host "📦 Love Bank App - GitHub Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if repository exists on GitHub
Write-Host "⚠️  IMPORTANT - First Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Before running this script, you MUST create the GitHub repository:"
Write-Host ""
Write-Host "1. Go to: https://github.com/new"
Write-Host "2. Fill in these details:"
Write-Host "   - Repository name: lovebankapp"
Write-Host "   - Description: A relationship investment framework web application"
Write-Host "   - Visibility: Public"
Write-Host "   - Initialize: Leave ALL boxes unchecked (no README, gitignore, or license)"
Write-Host "3. Click 'Create repository'"
Write-Host ""
Write-Host "4. Come back here and press ENTER to continue"
Read-Host "Press ENTER when you've created the repository on GitHub"

Write-Host ""
Write-Host "✅ Pushing code to GitHub..." -ForegroundColor Green

# Change to app directory
cd "c:\VisualStudioCodeWorkspaces\VisualStudioCodePromptEngineer\love-bank-app"

# Add remote if not already added
Write-Host "Setting up remote repository..."
git remote remove origin 2>$null
git remote add origin https://github.com/jdgraves1995/lovebankapp.git

# Ensure we're on main branch
Write-Host "Ensuring main branch..."
git branch -M main

# Push to GitHub
Write-Host "Pushing commits to GitHub..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ CODE PUSHED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next: Enable GitHub Pages" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Go to: https://github.com/jdgraves1995/lovebankapp"
    Write-Host "2. Click Settings (gear icon)"
    Write-Host "3. Click Pages in the left sidebar"
    Write-Host "4. Under 'Build and deployment':"
    Write-Host "   - Source: Select 'Deploy from a branch'"
    Write-Host "   - Branch: Select 'main'"
    Write-Host "   - Folder: Select '/ (root)'"
    Write-Host "5. Click Save"
    Write-Host ""
    Write-Host "⏳ GitHub will build your site (1-2 minutes)..."
    Write-Host ""
    Write-Host "🚀 Your live app will be at:" -ForegroundColor Green
    Write-Host "   https://jdgraves1995.github.io/lovebankapp"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error pushing to GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:"
    Write-Host "1. Repository not created on GitHub yet"
    Write-Host "2. Wrong repository name (should be: lovebankapp)"
    Write-Host "3. Network connectivity issue"
    Write-Host ""
    Write-Host "Please verify the repository exists at:"
    Write-Host "https://github.com/jdgraves1995/lovebankapp"
}

Write-Host ""
Read-Host "Press ENTER to close"
