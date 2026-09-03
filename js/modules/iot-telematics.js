/**
 * Aachico Vault - IoT GPS Telematics & Hardware Integration
 * Path: js/modules/iot-telematics.js
 */

(function () {
    'use strict';

    // Live GPS Telematics Sync Simulator (Teltonika / Concox Protocol)
    window.syncGPSCoordinates = function(vehicleId, rawDevicePacket) {
        // Parsing GPS raw packet data
        const parsedData = {
            vehicleId: vehicleId,
            latitude: rawDevicePacket.lat || 0.0,
            longitude: rawDevicePacket.lng || 0.0,
            speedKmH: rawDevicePacket.speed || 0,
            ignitionStatus: rawDevicePacket.ignition === true,
            timestamp: new Date().toISOString()
        };

        console.log(`GPS Synced for Vehicle ${vehicleId}: Lat ${parsedData.latitude}, Lng ${parsedData.longitude}`);
        return parsedData;
    };

    // Remote Engine Immobilizer (Kill Switch) Trigger
    window.triggerKillSwitch = function(vehicleId, ownerAuthPin) {
        // Verify owner authorization pin or Stealth session token
        if (!ownerAuthPin || ownerAuthPin !== 'SECURE_MASTER_PIN') {
            console.error("Unauthorized Kill Switch attempt!");
            return { success: false, message: 'Invalid Master Authorization PIN.' };
        }

        // Send hardware shut-off signal to vehicle ECU / Relay
        console.warn(`CRITICAL: Kill Switch activated for Vehicle ID: ${vehicleId}. Fuel supply & battery cut.`);
        
        return {
            vehicleId: vehicleId,
            status: 'ENGIN_LOCKED',
            executedAt: new Date().toISOString(),
            message: 'Vehicle fuel supply and ignition remotely cut successfully.'
        };
    };

    // Fuel Anti-Siphon (Diesel Theft) Sensor Monitor
    window.monitorFuelAntiSiphon = function(vehicleId, currentFuelLiters, previousFuelLiters, isEngineRunning) {
        const dropThresholdLiters = 15; // Sudden drop threshold
        const fuelDrop = previousFuelLiters - currentFuelLiters;

        // If fuel drops significantly while the engine is turned OFF -> Possible theft!
        if (!isEngineRunning && fuelDrop >= dropThresholdLiters) {
            return {
                alert: true,
                severity: 'CRITICAL',
                message: `ANTI-THEFT ALERT: Sudden fuel drop of ${fuelDrop}L detected while ignition is OFF in Vehicle ${vehicleId}!`
            };
        }

        return { alert: false, message: 'Fuel level normal.' };
    };

    console.log("Aachico Vault IoT Telematics & Hardware Module Loaded Successfully.");
})();
