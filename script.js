// ===========================
// LOVE BANK APP - MAIN LOGIC
// ===========================

// Data Model & State Management
const LoveBank = {
    // App state
    state: {
        currentUserId: null,
        currentViewFriendId: null, // Track which friend we're viewing
        users: [],
        friendships: [],
        transactions: [],
        loveBanks: {}
    },

    // Initialize app
    init() {
        this.loadFromStorage();
        if (!this.state.users.length) {
            this.seedData();
        }
        console.log('LoveBank initialized:', this.state);
    },

    // ===========================
    // DATA MANAGEMENT
    // ===========================

    loadFromStorage() {
        const saved = localStorage.getItem('lovebank_data');
        if (saved) {
            this.state = JSON.parse(saved);
        }
    },

    saveToStorage() {
        localStorage.setItem('lovebank_data', JSON.stringify(this.state));
    },

    seedData() {
        // Create initial users
        this.state.users = [
            { id: 'user1', username: 'Alice' },
            { id: 'user2', username: 'Bob' },
            { id: 'user3', username: 'Charlie' }
        ];

        // Initialize love banks
        this.state.users.forEach(user => {
            this.state.loveBanks[user.id] = {
                userId: user.id,
                balance: 100 // Starting balance
            };
        });

        // Create friendships
        this.state.friendships = [
            { id: 'f1', userAId: 'user1', userBId: 'user2', status: 'accepted' },
            { id: 'f2', userAId: 'user1', userBId: 'user3', status: 'accepted' }
        ];

        // Add some sample transactions
        this.state.transactions = [
            {
                id: 't1',
                fromUserId: 'user2',
                toUserId: 'user1',
                amount: 10,
                type: 'deposit',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 't2',
                fromUserId: 'user1',
                toUserId: 'user1',
                amount: 5,
                type: 'withdrawal',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ];

        // Apply transactions to balances
        this.state.transactions.forEach(tx => {
            if (tx.type === 'deposit') {
                this.state.loveBanks[tx.toUserId].balance += tx.amount;
            } else if (tx.type === 'withdrawal') {
                this.state.loveBanks[tx.fromUserId].balance -= tx.amount;
            }
        });

        this.saveToStorage();
    },

    // ===========================
    // USER MANAGEMENT
    // ===========================

    getUser(userId) {
        return this.state.users.find(u => u.id === userId);
    },

    getUserBalance(userId) {
        return this.state.loveBanks[userId]?.balance || 0;
    },

    setCurrentUser(userId) {
        this.state.currentUserId = userId;
        this.saveToStorage();
    },

    getCurrentUser() {
        return this.getUser(this.state.currentUserId);
    },

    // ===========================
    // FRIEND MANAGEMENT
    // ===========================

    getFriendsOfUser(userId) {
        return this.state.friendships
            .filter(f => f.status === 'accepted' && (f.userAId === userId || f.userBId === userId))
            .map(f => {
                const friendId = f.userAId === userId ? f.userBId : f.userAId;
                return this.getUser(friendId);
            });
    },

    isFriend(userId1, userId2) {
        return this.state.friendships.some(f =>
            f.status === 'accepted' &&
            ((f.userAId === userId1 && f.userBId === userId2) ||
                (f.userAId === userId2 && f.userBId === userId1))
        );
    },

    addFriend(currentUserId, friendId) {
        // Check if already friends or if same user
        if (currentUserId === friendId) {
            return { success: false, message: 'Cannot add yourself as a friend' };
        }

        if (this.isFriend(currentUserId, friendId)) {
            return { success: false, message: 'Already friends' };
        }

        // Create friendship
        const newFriendship = {
            id: 'f' + Date.now(),
            userAId: currentUserId,
            userBId: friendId,
            status: 'accepted'
        };

        this.state.friendships.push(newFriendship);
        this.saveToStorage();
        return { success: true, message: 'Friend added successfully' };
    },

    removeFriend(currentUserId, friendId) {
        const index = this.state.friendships.findIndex(f =>
            f.status === 'accepted' &&
            ((f.userAId === currentUserId && f.userBId === friendId) ||
                (f.userAId === friendId && f.userBId === currentUserId))
        );

        if (index === -1) {
            return { success: false, message: 'Friend not found' };
        }

        this.state.friendships.splice(index, 1);
        this.saveToStorage();
        return { success: true, message: 'Friend removed' };
    },

    // ===========================
    // TRANSACTION MANAGEMENT
    // ===========================

    deposit(fromUserId, toUserId, amount) {
        // Validation
        if (fromUserId === toUserId) {
            return { success: false, message: 'Cannot deposit to yourself' };
        }

        if (!this.isFriend(fromUserId, toUserId)) {
            return { success: false, message: 'Can only deposit to friends' };
        }

        if (this.state.loveBanks[fromUserId].balance < amount) {
            return { success: false, message: 'Insufficient balance' };
        }

        // Create transaction
        const transaction = {
            id: 't' + Date.now(),
            fromUserId: fromUserId,
            toUserId: toUserId,
            amount: amount,
            type: 'deposit',
            timestamp: new Date().toISOString()
        };

        this.state.transactions.push(transaction);

        // Update balances
        this.state.loveBanks[fromUserId].balance -= amount;
        this.state.loveBanks[toUserId].balance += amount;

        this.saveToStorage();
        return { success: true, message: `Deposited ${amount} Love Bucks to ${this.getUser(toUserId).username}` };
    },

    withdraw(userId, amount) {
        // Get current balance
        const currentBalance = this.state.loveBanks[userId].balance;
        
        // Calculate actual withdrawal amount (cap at current balance)
        const actualWithdrawal = Math.min(amount, currentBalance);

        // Create transaction (withdrawal is from and to same user)
        const transaction = {
            id: 't' + Date.now(),
            fromUserId: userId,
            toUserId: userId,
            amount: actualWithdrawal,
            type: 'withdrawal',
            timestamp: new Date().toISOString()
        };

        this.state.transactions.push(transaction);

        // Update balance
        this.state.loveBanks[userId].balance -= actualWithdrawal;

        this.saveToStorage();

        // Check if they tried to withdraw more than available
        if (actualWithdrawal < amount) {
            return { 
                success: true, 
                message: `Withdrew ${actualWithdrawal} Love Bucks. You've reached your limit (balance is now 0)` 
            };
        }

        return { success: true, message: `Withdrew ${actualWithdrawal} Love Bucks from your account` };
    },

    getTransactionsForUser(userId) {
        return this.state.transactions.filter(t =>
            t.fromUserId === userId || t.toUserId === userId
        );
    },

    getSharedTransactions(userId1, userId2) {
        return this.state.transactions.filter(t =>
            (t.fromUserId === userId1 && t.toUserId === userId2) ||
            (t.fromUserId === userId2 && t.toUserId === userId1)
        );
    }
};

// ===========================
// UI MANAGER
// ===========================

const UI = {
    // DOM Elements
    elements: {
        app: null,
        loginScreen: null,
        dashboard: null,
        currentUsername: null,
        userBalance: null,
        friendsList: null,
        transactionsList: null,
        transactionFilter: null,
        deposits: {},
        withdrawals: {},
        addFriend: {}
    },

    init() {
        this.cacheElements();
        this.render();
    },

    cacheElements() {
        this.elements.app = document.getElementById('app');
        this.elements.loginScreen = document.getElementById('loginScreen');
        this.elements.dashboard = document.getElementById('dashboard');
        this.elements.currentUsername = document.getElementById('currentUsername');
        this.elements.userBalance = document.getElementById('userBalance');
        this.elements.transactionsList = document.getElementById('transactionsList');
        this.elements.transactionFilter = document.getElementById('transactionFilter');
        
        // New elements for tabbed navigation
        this.elements.friendsBtn = document.getElementById('friendsBtn');
        this.elements.friendsDropdown = document.getElementById('friendsDropdown');
        this.elements.friendsDropdownList = document.getElementById('friendsDropdownList');
        this.elements.friendSearchInput = document.getElementById('friendSearchInput');
        this.elements.backToAccountBtn = document.getElementById('backToAccountBtn');
        
        // Own account view
        this.elements.ownAccountView = document.getElementById('ownAccountView');
        
        // Friend view
        this.elements.friendView = document.getElementById('friendView');
        this.elements.friendViewName = document.getElementById('friendViewName');
        this.elements.friendViewBalance = document.getElementById('friendViewBalance');
        this.elements.friendViewSubtitle = document.getElementById('friendViewSubtitle');
        this.elements.friendViewTransactionsList = document.getElementById('friendViewTransactionsList');
    },

    // ===========================
    // RENDER METHODS
    // ===========================

    render() {
        if (LoveBank.state.currentUserId) {
            this.showDashboard();
        } else {
            this.showLoginScreen();
        }
    },

    showLoginScreen() {
        this.elements.loginScreen.classList.remove('hidden');
        this.elements.dashboard.classList.add('hidden');
        this.renderLoginOptions();
    },

    showDashboard() {
        this.elements.loginScreen.classList.add('hidden');
        this.elements.dashboard.classList.remove('hidden');
        this.updateDashboard();
    },

    renderLoginOptions() {
        const select = document.getElementById('loginUsername');
        select.innerHTML = '<option value="">-- Choose a user --</option>';

        LoveBank.state.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;
            select.appendChild(option);
        });
    },

    updateDashboard() {
        const currentUser = LoveBank.getCurrentUser();
        const balance = LoveBank.getUserBalance(currentUser.id);

        this.elements.currentUsername.textContent = currentUser.username;

        // Show the appropriate view based on whether we're viewing a friend
        if (LoveBank.state.currentViewFriendId) {
            this.showFriendView(LoveBank.state.currentViewFriendId);
        } else {
            this.showOwnAccountView();
        }
    },

    showOwnAccountView() {
        // Hide friend view, show own account
        this.elements.ownAccountView.classList.remove('hidden');
        this.elements.friendView.classList.add('hidden');
        this.elements.backToAccountBtn.classList.add('hidden');
        this.elements.friendsBtn.classList.remove('active');

        // Update own account display
        const currentUser = LoveBank.getCurrentUser();
        const balance = LoveBank.getUserBalance(currentUser.id);
        this.elements.userBalance.textContent = balance;
        this.renderTransactionsList();
    },

    showFriendView(friendId) {
        // Show friend view, hide own account
        this.elements.ownAccountView.classList.add('hidden');
        this.elements.friendView.classList.remove('hidden');
        this.elements.backToAccountBtn.classList.remove('hidden');
        this.elements.friendsBtn.classList.add('active');

        // Update friend view display
        const friend = LoveBank.getUser(friendId);
        const balance = LoveBank.getUserBalance(friendId);
        
        this.elements.friendViewName.textContent = `${friend.username}'s Love Bank`;
        this.elements.friendViewBalance.textContent = balance;
        this.elements.friendViewSubtitle.textContent = `${friend.username} has this many Love Bucks available`;

        // Show shared transactions
        const transactions = LoveBank.getSharedTransactions(LoveBank.state.currentUserId, friendId);
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.elements.friendViewTransactionsList.innerHTML = '';

        if (transactions.length === 0) {
            this.elements.friendViewTransactionsList.innerHTML = '<div class="empty-state">No shared transactions yet</div>';
        } else {
            transactions.forEach(tx => {
                const isDeposit = tx.type === 'deposit';
                const date = new Date(tx.timestamp).toLocaleDateString();

                let description;
                if (isDeposit) {
                    if (LoveBank.state.currentUserId === tx.toUserId) {
                        description = `Received from ${friend.username}`;
                    } else {
                        description = `Sent to ${friend.username}`;
                    }
                } else {
                    description = 'Withdrawal';
                }

                const div = document.createElement('div');
                div.className = 'transaction-item';
                div.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-description">${description}</div>
                        <div class="transaction-timestamp">${date}</div>
                    </div>
                    <div class="transaction-amount ${tx.type}">
                        ${isDeposit ? '+' : '-'}${tx.amount}
                    </div>
                `;
                this.elements.friendViewTransactionsList.appendChild(div);
            });
        }
    },

    renderFriendsDropdown() {
        const currentUser = LoveBank.getCurrentUser();
        const friends = LoveBank.getFriendsOfUser(currentUser.id);
        const searchValue = this.elements.friendSearchInput.value.toLowerCase();

        const filtered = friends.filter(f => f.username.toLowerCase().includes(searchValue));

        this.elements.friendsDropdownList.innerHTML = '';

        if (filtered.length === 0) {
            this.elements.friendsDropdownList.innerHTML = '<div class="empty-state" style="padding: 16px; text-align: center;">No friends found</div>';
            return;
        }

        filtered.forEach(friend => {
            const balance = LoveBank.getUserBalance(friend.id);
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.innerHTML = `
                <div>
                    <div class="dropdown-item-name">${friend.username}</div>
                    <div class="dropdown-item-balance">${balance} Love Bucks</div>
                </div>
            `;
            div.addEventListener('click', () => {
                LoveBank.state.currentViewFriendId = friend.id;
                UI.updateDashboard();
                UI.closeFriendsDropdown();
                MobileDrawer.close();
            });
            this.elements.friendsDropdownList.appendChild(div);
        });
    },

    toggleFriendsDropdown() {
        this.elements.friendsDropdown.classList.toggle('hidden');
        if (!this.elements.friendsDropdown.classList.contains('hidden')) {
            this.renderFriendsDropdown();
            this.elements.friendSearchInput.focus();
        }
    },

    closeFriendsDropdown() {
        this.elements.friendsDropdown.classList.add('hidden');
    },

    renderTransactionsList(filter = '') {
        const currentUser = LoveBank.getCurrentUser();
        let transactions = LoveBank.getTransactionsForUser(currentUser.id);

        // Apply filter
        if (filter === 'deposit') {
            transactions = transactions.filter(t => t.type === 'deposit');
        } else if (filter === 'withdrawal') {
            transactions = transactions.filter(t => t.type === 'withdrawal');
        }

        // Sort by timestamp (newest first)
        transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        this.elements.transactionsList.innerHTML = '';

        if (transactions.length === 0) {
            this.elements.transactionsList.innerHTML = '<div class="empty-state">No transactions yet</div>';
            return;
        }

        transactions.forEach(tx => {
            const isDeposit = tx.type === 'deposit';
            const otherUserId = currentUser.id === tx.fromUserId ? tx.toUserId : tx.fromUserId;
            const otherUser = LoveBank.getUser(otherUserId);
            const date = new Date(tx.timestamp).toLocaleDateString();

            const div = document.createElement('div');
            div.className = 'transaction-item';

            let description;
            if (isDeposit) {
                if (currentUser.id === tx.toUserId) {
                    description = `Received from ${otherUser.username}`;
                } else {
                    description = `Sent to ${otherUser.username}`;
                }
            } else {
                description = 'Withdrawal';
            }

            div.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${description}</div>
                    <div class="transaction-timestamp">${date}</div>
                </div>
                <div class="transaction-amount ${tx.type}">
                    ${isDeposit ? '+' : '-'}${tx.amount}
                </div>
            `;

            this.elements.transactionsList.appendChild(div);
        });
    },

    // ===========================
    // MODAL MANAGEMENT
    // ===========================

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('modalOverlay');
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    },

    // ===========================
    // MESSAGE DISPLAY
    // ===========================

    showMessage(elementId, message, type = 'info') {
        const msgElement = document.getElementById(elementId);
        msgElement.textContent = message;
        msgElement.className = `message ${type}`;
        msgElement.classList.remove('hidden');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            msgElement.classList.add('hidden');
        }, 3000);
    }
};

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
    // Login
    document.getElementById('loginBtn').addEventListener('click', () => {
        const select = document.getElementById('loginUsername');
        if (select.value) {
            LoveBank.setCurrentUser(select.value);
            UI.render();
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        LoveBank.state.currentUserId = null;
        LoveBank.state.currentViewFriendId = null;
        LoveBank.saveToStorage();
        UI.render();
        MobileDrawer.close();
    });

    // Navigation tabs
    document.getElementById('friendsBtn').addEventListener('click', () => {
        UI.toggleFriendsDropdown();
    });

    // Friend search input
    document.getElementById('friendSearchInput').addEventListener('input', () => {
        UI.renderFriendsDropdown();
    });

    // Back to account button
    document.getElementById('backToAccountBtn').addEventListener('click', () => {
        LoveBank.state.currentViewFriendId = null;
        UI.updateDashboard();
        UI.closeFriendsDropdown();
        MobileDrawer.close();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const friendsDropdown = document.querySelector('.friends-dropdown');
        const connectBtn = document.getElementById('connectFriendsBtn');
        if (friendsDropdown && !friendsDropdown.contains(e.target) && 
            !(connectBtn && connectBtn.contains(e.target))) {
            UI.closeFriendsDropdown();
        }
    });

    // Deposit button (from own account)
    document.getElementById('depositBtn').addEventListener('click', () => {
        updateDepositFriendSelect();
        UI.showModal('depositModal');
    });

    // Deposit button (from friend view)
    document.getElementById('depositToFriendBtn').addEventListener('click', () => {
        const friendId = LoveBank.state.currentViewFriendId;
        const friendName = LoveBank.getUser(friendId).username;
        
        const select = document.getElementById('depositFriendSelect');
        select.value = friendId;
        
        UI.showModal('depositModal');
    });

    // Withdraw button
    document.getElementById('withdrawBtn').addEventListener('click', () => {
        UI.showModal('withdrawModal');
    });

    // Amount buttons for deposit
    document.querySelectorAll('#depositModal .amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#depositModal .amount-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            document.getElementById('depositAmount').textContent = e.currentTarget.dataset.amount;
        });
    });

    // Amount buttons for withdraw
    document.querySelectorAll('#withdrawModal .amount-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#withdrawModal .amount-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            document.getElementById('withdrawAmount').textContent = e.currentTarget.dataset.amount;
        });
    });

    // Deposit confirm
    document.getElementById('depositConfirmBtn').addEventListener('click', () => {
        const friendId = document.getElementById('depositFriendSelect').value;
        const amount = parseInt(document.getElementById('depositAmount').textContent) || 0;

        if (!friendId) {
            UI.showMessage('depositMessage', 'Please select a friend', 'error');
            return;
        }

        if (amount === 0) {
            UI.showMessage('depositMessage', 'Please select an amount', 'error');
            return;
        }

        const result = LoveBank.deposit(LoveBank.state.currentUserId, friendId, amount);

        if (result.success) {
            UI.showMessage('depositMessage', result.message, 'success');
            setTimeout(() => {
                UI.hideModal('depositModal');
                UI.updateDashboard();
                resetDepositForm();
            }, 500);
        } else {
            UI.showMessage('depositMessage', result.message, 'error');
        }
    });

    // Withdraw confirm
    document.getElementById('withdrawConfirmBtn').addEventListener('click', () => {
        const amount = parseInt(document.getElementById('withdrawAmount').textContent) || 0;

        if (amount === 0) {
            UI.showMessage('withdrawMessage', 'Please select an amount', 'error');
            return;
        }

        const result = LoveBank.withdraw(LoveBank.state.currentUserId, amount);

        if (result.success) {
            UI.showMessage('withdrawMessage', result.message, 'success');
            setTimeout(() => {
                UI.hideModal('withdrawModal');
                UI.updateDashboard();
                resetWithdrawForm();
            }, 500);
        } else {
            UI.showMessage('withdrawMessage', result.message, 'error');
        }
    });

    // Add friend confirm
    document.getElementById('addFriendConfirmBtn').addEventListener('click', () => {
        const friendId = document.getElementById('addFriendSelect').value;

        if (!friendId) {
            UI.showMessage('addFriendMessage', 'Please select a user', 'error');
            return;
        }

        const result = LoveBank.addFriend(LoveBank.state.currentUserId, friendId);

        if (result.success) {
            UI.showMessage('addFriendMessage', result.message, 'success');
            setTimeout(() => {
                UI.hideModal('addFriendModal');
                UI.updateDashboard();
            }, 500);
        } else {
            UI.showMessage('addFriendMessage', result.message, 'error');
        }
    });

    // Close modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.currentTarget.dataset.modal;
            UI.hideModal(modalId);
        });
    });

    document.getElementById('depositCancelBtn').addEventListener('click', () => {
        UI.hideModal('depositModal');
        resetDepositForm();
    });

    document.getElementById('withdrawCancelBtn').addEventListener('click', () => {
        UI.hideModal('withdrawModal');
        resetWithdrawForm();
    });

    document.getElementById('addFriendCancelBtn').addEventListener('click', () => {
        UI.hideModal('addFriendModal');
    });

    // Transaction filter
    document.getElementById('transactionFilter').addEventListener('change', (e) => {
        UI.renderTransactionsList(e.currentTarget.value);
    });

    // Modal overlay click
    document.getElementById('modalOverlay').addEventListener('click', () => {
        const openModals = document.querySelectorAll('.modal:not(.hidden)');
        openModals.forEach(modal => {
            const modalId = modal.id;
            UI.hideModal(modalId);
        });
    });
}

// ===========================
// HELPER FUNCTIONS
// ===========================

function updateDepositFriendSelect() {
    const select = document.getElementById('depositFriendSelect');
    const friends = LoveBank.getFriendsOfUser(LoveBank.state.currentUserId);

    select.innerHTML = '<option value="">-- Choose a friend --</option>';

    friends.forEach(friend => {
        const option = document.createElement('option');
        option.value = friend.id;
        option.textContent = friend.username;
        select.appendChild(option);
    });
}

function resetDepositForm() {
    document.getElementById('depositAmount').textContent = '0';
    document.getElementById('depositFriendSelect').value = '';
    document.getElementById('depositMessage').classList.add('hidden');
    document.querySelectorAll('#depositModal .amount-btn').forEach(b => b.classList.remove('selected'));
}

function resetWithdrawForm() {
    document.getElementById('withdrawAmount').textContent = '0';
    document.getElementById('withdrawMessage').classList.add('hidden');
    document.querySelectorAll('#withdrawModal .amount-btn').forEach(b => b.classList.remove('selected'));
}

function findFriendIdByName(friendName) {
    const friend = LoveBank.state.users.find(u => u.username === friendName);
    return friend ? friend.id : null;
}

// ===========================
// THEME MANAGEMENT SYSTEM
// Handles switching between light and dark modes with localStorage persistence
// Uses CSS custom properties (CSS variables) to adapt colors dynamically
// =========================== 

const ThemeManager = {
    // Track the current theme mode
    currentTheme: 'light', // Default to light mode

    // Initialize the theme system on app startup
    init() {
        // Load user's saved theme preference from localStorage
        // If no preference exists, use 'light' as default
        this.currentTheme = localStorage.getItem('love_bank_theme') || 'light';
        
        // Apply the loaded theme to the page
        this.applyTheme(this.currentTheme);
        
        // Attach the toggle button to theme switching functionality
        this.setupToggleListener();
    },

    // Apply a theme by setting the data-theme attribute on root element
    // The CSS [data-theme="dark"] selector will automatically update all colors
    applyTheme(theme) {
        // Store the theme preference
        this.currentTheme = theme;

        // Set the data-theme attribute on root element for CSS to respond to
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            // Remove the attribute for light mode (default CSS)
            document.documentElement.removeAttribute('data-theme');
        }

        // Save the user's theme choice to localStorage for persistence across sessions
        localStorage.setItem('love_bank_theme', theme);

        // Update the icon to reflect the current theme
        this.updateToggleIcon();
    },

    // Toggle between light and dark themes
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },

    // Update the toggle button icon to show what theme is active
    // Shows 🌙 moon in light mode (indicating dark mode is available)
    // Shows ☀️ sun in dark mode (indicating light mode is available)
    updateToggleIcon() {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            // Show opposite icon to encourage switching
            icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    },

    // Attach click listener to the theme toggle button
    setupToggleListener() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
};

// ===========================
// HEADER COLLAPSE MANAGER
// Handles collapsible header that minimizes to a thin ridge when not focused
// Expands on hover to show full navigation
// =========================== 

const HeaderManager = {
    // Track the collapse timeout to cancel if mouse re-enters
    collapseTimeout: null,
    
    // Initialize header collapse functionality
    init() {
        const header = document.querySelector('.app-header');
        
        if (!header) {
            console.warn('Header element not found');
            return;
        }
        
        // Start with header in collapsed state to save space
        this.collapse();
        
        // Expand header when user hovers over it
        header.addEventListener('mouseenter', () => {
            this.expand();
            // Clear any pending collapse timeout
            if (this.collapseTimeout) {
                clearTimeout(this.collapseTimeout);
                this.collapseTimeout = null;
            }
        });
        
        // Collapse header after user moves mouse away
        header.addEventListener('mouseleave', () => {
            // Use timeout to allow for smooth transition with delay before collapsing
            // This prevents flickering if user quickly re-enters
            this.collapseTimeout = setTimeout(() => {
                this.collapse();
                this.collapseTimeout = null;
            }, 800);
        });
    },
    
    // Expand header to show full content
    expand() {
        const header = document.querySelector('.app-header');
        if (header && header.classList.contains('collapsed')) {
            header.classList.remove('collapsed');
        }
    },
    
    // Collapse header to minimal ridge
    collapse() {
        const header = document.querySelector('.app-header');
        if (header && !header.classList.contains('collapsed')) {
            header.classList.add('collapsed');
        }
    }
};

function autoLogin() {
    // Auto-login first user for development
    if (!LoveBank.state.currentUserId && LoveBank.state.users.length > 0) {
        LoveBank.setCurrentUser(LoveBank.state.users[0].id);
    }
}

// ===========================
// APP INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme system FIRST so colors are applied before any content renders
    ThemeManager.init();
    
    // Initialize collapsible header right after theme
    HeaderManager.init();
    
    // Initialize mobile drawer
    MobileDrawer.init();

    // Then initialize app logic and UI
    LoveBank.init();
    autoLogin();
    UI.init();
    setupEventListeners();
});

// ===========================
// MOBILE DRAWER
// Bottom-sheet drawer toggled by hamburger button
// ===========================
const MobileDrawer = {
    drawer: null,
    overlay: null,

    init() {
        this.drawer = document.getElementById('mobileDrawer');
        this.overlay = document.getElementById('mobileDrawerOverlay');
        const hamburger = document.getElementById('hamburgerBtn');
        const closeBtn = document.getElementById('drawerCloseBtn');
        const connectFriendsBtn = document.getElementById('connectFriendsBtn');

        if (!this.drawer || !hamburger) return;

        hamburger.addEventListener('click', () => this.open());
        closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        // Connect Friends feature item opens friends dropdown
        if (connectFriendsBtn) {
            connectFriendsBtn.addEventListener('click', () => {
                UI.toggleFriendsDropdown();
            });
        }
    },

    open() {
        this.drawer.classList.add('open');
        this.overlay.classList.add('open');
    },

    close() {
        this.drawer.classList.remove('open');
        this.overlay.classList.remove('open');
    }
};
