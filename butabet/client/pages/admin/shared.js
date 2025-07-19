// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Authentication utilities
class AuthManager {
    static setToken(token) {
        localStorage.setItem('adminToken', token);
    }
    
    static getToken() {
        return localStorage.getItem('adminToken');
    }
    
    static removeToken() {
        localStorage.removeItem('adminToken');
    }
    
    static setUserData(userData) {
        localStorage.setItem('adminUserData', JSON.stringify(userData));
    }
    
    static getUserData() {
        const userData = localStorage.getItem('adminUserData');
        return userData ? JSON.parse(userData) : null;
    }
    
    static clearUserData() {
        localStorage.removeItem('adminUserData');
    }
    
    static isAuthenticated() {
        return !!this.getToken();
    }
    
    static logout() {
        this.removeToken();
        this.clearUserData();
        window.location.href = '../auth/login.html';
    }
}

// API utilities
class APIClient {
    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers
            });
            
            if (response.status === 401) {
                // Token expired or invalid
                console.warn('Authentication failed - redirecting to login');
                AuthManager.logout();
                return;
            }
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || 'Request failed');
            }
            
            return response.json();
        } catch (error) {
            console.error('API request error:', error);
            // Don't auto-logout on network errors - only on 401 responses
            if (error.message && error.message.includes('Failed to fetch')) {
                console.warn('Network error - check if backend is running');
            }
            throw error;
        }
    }
    
    // Admin API methods
    static async getDashboardStats() {
        return this.request('/admin/dashboard-stats');
    }
    
    static async getAllUsers() {
        return this.request('/admin/users');
    }
    
    static async getUserById(id) {
        return this.request(`/admin/users/${id}`);
    }
    
    static async updateUser(id, userData) {
        return this.request(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }
    
    static async deleteUser(id) {
        return this.request(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    }
    
    static async getUserBalance(userId) {
        return this.request(`/admin/users/${userId}/balance`);
    }
    
    static async updateBalance(userId, balanceData) {
        return this.request(`/admin/users/${userId}/balance`, {
            method: 'PUT',
            body: JSON.stringify(balanceData)
        });
    }
    
    
    static async getAllPaymentAccounts() {
        return this.request('/payment/admin/payment-accounts');
    }
    
    static async getPaymentAccountById(id) {
        return this.request(`/payment/admin/payment-accounts/${id}`);
    }
    
    static async updatePaymentAccount(id, accountData) {
        return this.request(`/payment/admin/payment-accounts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(accountData)
        });
    }
    
    static async getPendingTransactions() {
        return this.request('/admin/transactions/pending');
    }
    
    static async approveTransaction(transactionId, adminNotes = '') {
        return this.request(`/admin/transactions/${transactionId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ adminNotes })
        });
    }
    
    static async rejectTransaction(transactionId, adminNotes = '') {
        return this.request(`/admin/transactions/${transactionId}/reject`, {
            method: 'POST',
            body: JSON.stringify({ adminNotes })
        });
    }
}

// Dashboard Data Manager
class DashboardManager {
    static async loadDashboardStats() {
        // Stats have been removed from dashboard
        console.log('Dashboard loaded');
    }
    
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
}

// Add logout functionality to all pages
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                AuthManager.logout();
            }
        });
    }
});