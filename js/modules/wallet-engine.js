/**
 * Aachico Vault - Wallet & Micro-Pricing Engine
 * Path: js/modules/wallet-engine.js
 */

(function () {
    'use strict';

    // WhatsApp Recharge Flow Initiator
    window.initiateWhatsAppRecharge = function(tenantId, companyName, rechargeAmountINR) {
        const superAdminWhatsAppNumber = "919876543210"; // Master SuperAdmin Number
        const message = `Hello SuperAdmin, I want to top-up my Aachico Vault wallet.\nTenant ID: ${tenantId}\nCompany: ${companyName}\nRequested Amount: ₹${rechargeAmountINR}\n(Attached is my UPI Payment Screenshot)`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${superAdminWhatsAppNumber}?text=${encodedMessage}`;
        
        // Open WhatsApp Web/App
        window.open(whatsappURL, '_blank');
        return { status: 'PENDING_APPROVAL', amount: rechargeAmountINR };
    };

    // Micro-Pricing Deduction (Pay-per-Use or 1-Day Pass)
    window.processMicroTransaction = function(tenantId, serviceType, currentWalletBalance) {
        const pricingRules = {
            'PAY_PER_USE_REPORT': 10,   // ₹10 per CA report / E-way bill
            'ONE_DAY_PASS': 20,         // ₹20 for 24-hr advanced feature pass
            'MONTHLY_ADDON': 39         // ₹39 for continuous monthly service
        };

        const cost = pricingRules[serviceType] || 10;

        if (currentWalletBalance < cost) {
            return {
                success: false,
                message: `Insufficient wallet balance! Required: ₹${cost}, Available: ₹${currentWalletBalance}. Please top-up via WhatsApp.`
            };
        }

        const newBalance = currentWalletBalance - cost;
        console.log(`Micro-transaction successful for Tenant ${tenantId}. Deducted ₹${cost} for ${serviceType}. New Balance: ₹${newBalance}`);

        return {
            success: true,
            deductedAmount: cost,
            remainingBalance: newBalance,
            timestamp: new Date().toISOString()
        };
    };

    console.log("Aachico Vault Wallet & Micro-Pricing Engine Loaded Successfully.");
})();
