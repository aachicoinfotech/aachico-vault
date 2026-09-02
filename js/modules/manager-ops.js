// ==========================================================================
// Aachico Vault - Manager Operations Module (Duty Allotment, Tires & Swaps)
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * नई ड्यूटी या बुकिंग ऑलॉट करना
 */
export async function allotDuty(dutyData) {
  try {
    const docRef = await addDoc(collection(db, "manager_duties"), {
      clientName: dutyData.clientName,
      clientPhone: dutyData.clientPhone,
      vehicleNumber: dutyData.vehicleNumber,
      driverName: dutyData.driverName,
      pickupLocation: dutyData.pickupLocation,
      dropLocation: dutyData.dropLocation,
      allotmentDate: dutyData.allotmentDate,
      status: "Assigned",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "ड्यूटी सफलतापूर्वक ऑलॉट कर दी गई है!" };
  } catch (error) {
    console.error("Error allotting duty: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * टायर सीरियल नंबर और कंडीशन ट्रैक करना
 */
export async function registerTireSerial(tireData) {
  try {
    const docRef = await addDoc(collection(db, "tire_tracker"), {
      vehicleNumber: tireData.vehicleNumber,
      tireSerialNo: tireData.tireSerialNo,
      position: tireData.position, // e.g., Front-Left, Rear-Right
      installationKm: Number(tireData.installationKm) || 0,
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "टायर सीरियल सफलतापूर्वक दर्ज हो गया है!" };
  } catch (error) {
    console.error("Error registering tire: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * मिड-ट्रिप गाड़ी या ड्राइवर स्वैप (Mid-trip Swap) दर्ज करना
 */
export async function recordMidTripSwap(swapData) {
  try {
    const docRef = await addDoc(collection(db, "trip_swaps"), {
      tripId: swapData.tripId,
      previousVehicle: swapData.previousVehicle,
      newVehicle: swapData.newVehicle,
      reason: swapData.reason || "Mechanical / Operational",
      swapKm: Number(swapData.swapKm) || 0,
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "मिड-ट्रिप स्वैप सफलतापर्वक दर्ज हो गया है!" };
  } catch (error) {
    console.error("Error recording swap: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी मैनेजर ऑपरेशन्स डेटा लोड करना
 */
export async function fetchManagerOperations() {
  try {
    const dutiesSnap = await getDocs(query(collection(db, "manager_duties"), orderBy("createdAt", "desc")));
    let duties = [];
    dutiesSnap.forEach(doc => duties.push({ id: doc.id, ...doc.data() }));

    return { success: true, data: { duties } };
  } catch (error) {
    console.error("Error fetching manager ops: ", error);
    return { success: false, error: error.message, data: { duties: [] } };
  }
}
