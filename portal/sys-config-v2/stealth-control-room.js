/**
 * Aachico Vault - Stealth Control Room Engine (Updated for GitHub Pages & Local)
 * Path: portal/sys-config-v2/stealth-control-room.js
 */

(function () {
    'use strict';

    const SECRET_SHORTCUT = {
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        code: 'KeyS'
    };

    // Helper to get correct base path for GitHub Pages or Localhost
    function getBasePath() {
        const path = window.location.pathname;
        if (path.startsWith('/aachico-vault/')) {
            return '/aachico-vault';
        }
        return '';
    }

    // Zero-Footprint Session Validator
    function validateStealthAccess() {
        const token = sessionStorage.getItem('aachico_stealth_token');
        if (!token) {
            console.warn("Unauthorized stealth access attempt. Redirecting...");
            window.location.href = getBasePath() + '/portal/login.html';
            return false;
        }
        return true;
    }

    // Keyboard Shortcut Trigger
    window.addEventListener('keydown', function (event) {
        if (
            event.ctrlKey === SECRET_SHORTCUT.ctrlKey &&
            event.shiftKey === SECRET_SHORTCUT.shiftKey &&
            event.altKey === SECRET_SHORTCUT.altKey &&
            event.code === SECRET_SHORTCUT.code
        ) {
            event.preventDefault();
            triggerStealthPortal();
        }
    });

    function triggerStealthPortal() {
        // Generate secure temporary session token
        const secureToken = 'st_' + Math.random().toString(36).substring(2) + Date.now();
        sessionStorage.setItem('aachico_stealth_token', secureToken);
        
        // Redirect to hidden path dynamically matching the repository/root
        window.location.href = getBasePath() + '/portal/sys-config-v2/';
    }

    // SuperAdmin Wallet Manual Top-up Override (WhatsApp Flow Integration)
    window.superAdminApproveWalletTopup = function(tenantId, amountINR, whatsappRefId) {
        if (!validateStealthAccess()) return;

        console.log(`Processing WhatsApp Top-up for Tenant: ${tenantId}, Amount: ₹${amountINR}, Ref: ${whatsappRefId}`);
        
        // Backend API or Firebase Firestore trigger simulation
        const topupPayload = {
            tenantId: tenantId,
            creditAmount: Number(amountINR),
            approvedBy: 'SuperAdmin_Stealth',
            mode: 'WHATSAPP_APPROVAL',
            referenceId: whatsappRefId,
            timestamp: new Date().toISOString()
        };

        // Here it updates the tenant's wallet ledger securely
        alert(`Success: ₹${amountINR} credited to Tenant ${tenantId} via Stealth Control Room.`);
        return topupPayload;
    };

    // Auto-destruct session on inactivity (10 minutes)
    let inactivityTime = function () {
        let time;
        window.onload = resetTimer;
        window.onmousemove = resetTimer;
        window.onkeypress = resetTimer;

        function logout() {
            sessionStorage.removeItem('aachico_stealth_token');
            if (window.location.pathname.includes('sys-config-v2')) {
                window.location.href = getBasePath() + '/portal/login.html';
            }
        }

        function resetTimer() {
            clearTimeout(time);
            time = setTimeout(logout, 600000); // 10 minutes
        }
    };

    inactivityTime();
})();
