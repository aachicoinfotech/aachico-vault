// ==========================================================================
// Aachico Vault - Driver Terminal Module (Odometer Photos, Receipts & SOS)
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * ड्राइवर द्वारा ओडोमीटर फोटो और ट्रिप डेटा सबमिट करना
 */
export async function submitDriverOdometerLog(logData) {
  try {
    const docRef = await addDoc(collection(db, "driver_odometer_logs"), {
      driverName: logData.driverName,
      vehicleNumber: logData.vehicleNumber,
      readingType: logData.readingType, // 'Start' or 'End'
      odometerKm: Number(logData.odometerKm) || 0,
      photoUrl: logData.photoUrl || "", // Live photo proof
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "ओडोमीटर रीडिंग और फोटो सफलतापूर्वक दर्ज हो गई है!" };
  } catch (error) {
    console.error("Error submitting odometer log: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * बहुमूल्य पर्चियाँ (Receipts - Max 15) दर्ज करना (डीज़ल, टोल, रिपेयर आदि)
 */
export async function uploadDriverReceipt(receiptData) {
  try {
    const docRef = await addDoc(collection(db, "driver_receipts"), {
      driverName: receiptData.driverName,
      vehicleNumber: receiptData.vehicleNumber,
      receiptType: receiptData.receiptType, // Fuel, Toll, Parking, Misc
      amount: Number(receiptData.amount) || 0,
      receiptPhotoUrl: receiptData.receiptPhotoUrl || "",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "पर्ची (Receipt) सफलतापूर्वक अपलोड हो गई है!" };
  } catch (error) {
    console.error("Error uploading receipt: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * ड्राइवर द्वारा इमरजेंसी SOS अलर्ट ट्रिगर करना
 */
export async function triggerDriverSOS(sosData) {
  try {
    const docRef = await addDoc(collection(db, "sos_alerts"), {
      driverName: sosData.driverName,
      vehicleNumber: sosData.vehicleNumber,
      locationNote: sosData.locationNote || "Unknown Location",
      emergencyType: sosData.emergencyType || "Accident / Breakdown",
      status: "Active SOS",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "इमरजेंसी SOS अलर्ट एडमिन को भेज दिया गया है!" };
  } catch (error) {
    console.error("Error triggering SOS: ", error);
    return { success: false, error: error.message };
  }
}
