# ❤️ Love Bank

A relationship investment framework web application inspired by Dr. Harley's concepts. Track and manage your love bank balance with friends through a modern, interactive dashboard.

## Features

- 💖 **Track Your Bonds**: Monitor your love bank balance with friends
- 📈 **Invest & Grow**: Deposit and withdraw love bucks daily
- 🤝 **Connect Friends**: Build and manage your friend network
- 🌙 **Dark/Light Mode**: Beautiful theme toggle with smooth transitions
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 💾 **Local Storage**: Your data is saved locally in your browser

## Getting Started

1. Open `index.html` in your web browser
2. Select a user from the login dropdown (dev mode with test users)
3. Start tracking your love bank balance and transactions

## Project Structure

```
love-bank-app/
├── index.html              # Main application file
├── style.css               # Styling with dark/light theme
├── script.js               # Application logic
├── README.md               # This file
├── .github/
│   └── workflows/
│       └── pages.yml       # GitHub Actions deployment workflow
├── docs/                   # Documentation files
│   ├── LIVE_NOW.md         # Deployment confirmation
│   ├── QUICK_START.md      # Quick reference guide
│   ├── FINAL_DEPLOYMENT.md # Step-by-step deployment guide
│   └── [6 more guides]     # Additional documentation
└── scripts/                # Deployment automation scripts
    ├── deploy-complete.ps1 # Complete deployment with GitHub API
    ├── deploy.bat          # Windows batch automation
    └── push-to-github.ps1  # Git push helper
```

## Documentation

All documentation is organized in the `docs/` folder:
- **[LIVE_NOW.md](docs/LIVE_NOW.md)** - App is live, how to use it
- **[QUICK_START.md](docs/QUICK_START.md)** - Quick 3-step deployment
- **[FINAL_DEPLOYMENT.md](docs/FINAL_DEPLOYMENT.md)** - Detailed deployment steps
- See `docs/` folder for additional guides

## Deployment Scripts

Deployment automation scripts are in the `scripts/` folder:
- `deploy-complete.ps1` - Recommended for automated deployment
- `deploy.bat` - Alternative for GitHub CLI users
- `push-to-github.ps1` - Manual git push helper

## How to Use

### View Your Account
- See your total love bank balance
- Deposit love bucks to friends
- Withdraw love bucks from your own account
- Review all transaction history

### Manage Friends
- Click the "Friends" dropdown in the header
- Search for friends by name
- View individual friend accounts and their balances
- Track transactions with specific friends

### Toggle Theme
- Use the sun/moon toggle switch in the header
- Switch between light and dark modes
- Your preference is saved automatically

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser LocalStorage
- **Design**: CSS Variables for theme management
- **Layout**: Flexbox with responsive design

## Color Scheme

### Light Mode
- Primary: #E36A6A (Warm Coral-Red)
- Primary Dark: #C85555
- Primary Light: #FFB2B2 (Warm Light Pink)
- Background: #F5F7FA
- Surface: #FFFFFF

### Dark Mode
- Background: #141416 (Neutral Charcoal)
- Surface: #242428 (Neutral Slate)
- Text Primary: #F0F0F2 (Cool Off-White)
- Text Secondary: #A8A8B0 (Neutral Gray)

## Future Roadmap

- [ ] Supabase backend integration
- [ ] Real user authentication
- [ ] Database persistence
- [ ] Multi-device synchronization
- [ ] Friend requests and approvals
- [ ] Transaction notifications

## License

MIT License - feel free to use and modify for your own projects

## Author

Jacob Graves
