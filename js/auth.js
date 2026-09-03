/**
 * Aachico Vault - Authentication & Session Management Engine
 * Path: js/auth.js
 */

(function () {
    'use strict';

    // Role-Based Access Control (RBAC) definitions
    const ROLES = {
        SUPERADMIN: 'superadmin',
        ADMIN: 'admin',
        MANAGER: 'manager',
        DRIVER: 'driver'
    };

    // Check active session and validate role permissions
    window.AachicoAuth = {
        getCurrentUser: function () {
            const sessionData = sessionStorage.getItem('aachico_user_session');
            return sessionData ? JSON.parse(sessionData) : null;
        },

        loginUser: function (userData) {
            // userData format: { uid, email, role, companyId, token }
            sessionStorage.setItem('aachico_user_session', JSON.stringify(userData));
            
            // Duplicate login lock simulation / Token binding
            localStorage.setItem('aachico_active_token', userData.token);
            
            this.redirectByRole(userData.role);
        },

        redirectByRole: function (role) {
            const basePath = window.location.pathname.startsWith('/aachico-vault/') ? '/aachico-vault' : '';
            
            switch (role) {
                case ROLES.SUPERADMIN:
                    window.location.href = basePath + '/portal/sys-config-v2/';
                    break;
                case ROLES.ADMIN:
                    window.location.href = basePath + '/admin.html';
                    break;
                case ROLES.MANAGER:
                    window.location.href = basePath + '/manager.html';
                    break;
                case ROLES.DRIVER:
                    window.location.href = basePath + '/driver.html';
                    break;
                default:
                    window.location.href = basePath + '/login.html';
            }
        },

        protectPage: function (allowedRoles) {
            const user = this.getCurrentUser();
            const basePath = window.location.pathname.startsWith('/aachico-vault/') ? '/aachico-vault' : '';

            if (!user || !allowedRoles.includes(user.role)) {
                console.warn("Unauthorized access blocked. Redirecting to login...");
                window.location.href = basePath + '/login.html';
            }
        },

        logout: function () {
            sessionStorage.removeItem('aachico_user_session');
            localStorage.removeItem('aachico_active_token');
            const basePath = window.location.pathname.startsWith('/aachico-vault/') ? '/aachico-vault' : '';
            window.location.href = basePath + '/login.html';
        }
    };

    // Auto-destruct session on inactivity (15 minutes)
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (window.AachicoAuth.getCurrentUser()) {
                alert("Session expired due to inactivity.");
                window.AachicoAuth.logout();
            }
        }, 900000); // 15 minutes
    }

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);

})();
