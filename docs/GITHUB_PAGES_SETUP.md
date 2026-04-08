# GitHub Pages Setup Guide

## Quick Start

Your Love Bank app is ready to host on GitHub Pages! Follow these steps:

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository with the following settings:
   - **Repository name**: `love-bank` (or your preferred name)
   - **Description**: "A relationship investment framework web application"
   - **Visibility**: Public (required for GitHub Pages free tier)
   - **Do NOT initialize** with README, .gitignore, or license (we already have these)

### Step 2: Push Code to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd c:\VisualStudioCodeWorkspaces\VisualStudioCodePromptEngineer\love-bank-app

# Add your GitHub repo as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/love-bank.git

# Rename branch to main (GitHub Pages default)
git branch -M main

# Push code to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (gear icon, top right)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main` and `/root` folder
5. Click **Save**
6. GitHub will build your site and provide a URL (usually: `https://YOUR_USERNAME.github.io/love-bank`)

### Step 4: Access Your Live App

Your Love Bank app will be live at: `https://YOUR_USERNAME.github.io/love-bank`

It typically takes 1-2 minutes for GitHub Pages to build and publish your site.

## Files Included

- `index.html` - Main app file
- `style.css` - Complete styling with dark/light theme
- `script.js` - App logic and state management
- `README.md` - Project documentation
- `.gitignore` - Git ignore patterns
- `GITHUB_PAGES_SETUP.md` - This file

## Features Ready for Deployment

✅ Dark/Light mode toggle
✅ Responsive design (mobile, tablet, desktop)
✅ LocalStorage for data persistence
✅ Friend management
✅ Transaction history
✅ Modern UI with smooth animations

## Troubleshooting

**Site not loading?**
- Wait 1-2 minutes after enabling Pages (GitHub needs time to build)
- Check Settings > Pages to confirm build status
- Verify branch is set to `main` and folder is `/root`

**Styling looks broken?**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+Shift+R)

**Data not persisting?**
- LocalStorage data is browser-specific
- Each browser/device has its own data
- Data persists until browser cache is cleared

## Future Enhancements

When ready to add backend features:
1. Add Supabase integration to `script.js`
2. Replace LocalStorage with database calls
3. Implement user authentication
4. Deploy backend separately

## Support

For issues or questions about GitHub Pages, see:
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
