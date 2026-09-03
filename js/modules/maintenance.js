/**
 * Aachico Vault - Fleet Maintenance & Legal Compliance Radar
 * Path: js/modules/maintenance.js
 */

(function () {
    'use strict';

    // Check Legal Document Expiry (15-day red alert & Auto-block logic)
    window.checkComplianceRadar = function(vehicleData) {
        const currentDate = new Date();
        const alertThresholdDays = 15;
        let warnings = [];
        let isAutoBlocked = false;

        const documents = [
            { name: 'RC (Registration Certificate)', expiry: new Date(vehicleData.rcExpiry), criticalBlock: true },
            { name: 'Third-Party Insurance', expiry: new Date(vehicleData.insuranceExpiry), criticalBlock: false },
            { name: 'PUC (Pollution Certificate)', expiry: new Date(vehicleData.pucExpiry), criticalBlock: false },
            { name: 'Fitness Certificate', expiry: new Date(vehicleData.fitnessExpiry), criticalBlock: true }
        ];

        documents.forEach(doc => {
            const diffTime = doc.expiry - currentDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) {
                warnings.push(`EXPIRED: ${doc.name} expired ${Math.abs(diffDays)} days ago!`);
                if (doc.criticalBlock) {
                    isAutoBlocked = true; // Auto-block trip booking if RC or Fitness is expired
                }
            } else if (diffDays <= alertThresholdDays) {
                warnings.push(`RED ALERT: ${doc.name} is expiring in ${diffDays} days.`);
            }
        });

        return {
            vehicleNumber: vehicleData.vehicleNumber,
            isBlocked: isAutoBlocked,
            alerts: warnings
        };
    };

    // Engine Servicing & Odometer Mileage Tracker
    window.checkServiceReminder = function(currentOdometer, lastServiceOdometer) {
        const serviceIntervalKm = 10000; // Standard 10,000 km oil/filter change
        const kmSinceLastService = currentOdometer - lastServiceOdometer;

        if (kmSinceLastService >= serviceIntervalKm) {
            return {
                status: 'DUE',
                message: `Service Overdue! Run ${kmSinceLastService} km since last service.`
            };
        } else if (kmSinceLastService >= (serviceIntervalKm - 500)) {
            return {
                status: 'UPCOMING',
                message: `Service due soon in ${serviceIntervalKm - kmSinceLastService} km.`
            };
        }
        return { status: 'OK', message: 'Maintenance up to date.' };
    };

    console.log("Aachico Vault Maintenance & Legal Radar Module Loaded Successfully.");
})();
