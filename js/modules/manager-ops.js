// ==========================================================================
// Aachico Vault - Manager Operations Module (Duty Allotment, Tires & Swaps)
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * नई ड्यूटी या बुकिंग ऑलॉट करना (फायरबेस + लोकल स्टोरेज फॉलबैक के साथ)
 */
export async function allotDuty(dutyData) {
  try {
    const docRef = await addDoc(collection(db, "manager_duties"), {
      clientName: dutyData.clientName,
      clientPhone: dutyData.clientPhone,
      vehicleNumber: dutyData.vehicleNumber,
      driverName: dutyData.driverName,
      pickupLocation: dutyData.pickupLocation || "",
      dropLocation: dutyData.dropLocation || "",
      allotmentDate: dutyData.allotmentDate || new Date().toISOString().split('T')[0],
      status: "Assigned",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "ड्यूटी सफलतापूर्वक ऑलॉट कर दी गई है!" };
  } catch (error) {
    console.error("Error allotting duty: ", error);
    
    // यदि फायरबेस फेल हो जाए, तो लोकल स्टोरेज फॉलबैक उपयोग करें
    try {
      const localDuties = JSON.parse(localStorage.getItem('aachico_local_duties') || '[]');
      const newLocalDuty = { 
        id: 'local_' + Date.now(), 
        ...dutyData, 
        status: "Assigned", 
        createdAt: new Date().toISOString() 
      };
      localDuties.push(newLocalDuty);
      localStorage.setItem('aachico_local_duties', JSON.stringify(localDuties));

      return { success: true, id: newLocalDuty.id, message: "ऑफ़लाइन मोड: ड्यूटी स्थानीय रूप से सहेज ली गई है!" };
    } catch (localErr) {
      return { success: false, error: error.message };
    }
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

    return { success: true, id: docRef.id, message: "मिड-ट्रिप स्वैप सफलतापूर्वक दर्ज हो गया है!" };
  } catch (error) {
    console.error("Error recording swap: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी मैनेजर ऑपरेशन्स डेटा लोड करना (फायरबेस + लोकल स्टोरेज सिंक)
 */
export async function fetchManagerOperations() {
  try {
    const dutiesSnap = await getDocs(query(collection(db, "manager_duties"), orderBy("createdAt", "desc")));
    let duties = [];
    dutiesSnap.forEach(doc => duties.push({ id: doc.id, ...doc.data() }));

    // यदि लोकल स्टोरेज में कुछ ऑफलाइन ड्यूटी हैं, उन्हें भी शामिल करें
    const localDuties = JSON.parse(localStorage.getItem('aachico_local_duties') || '[]');
    const combinedDuties = [...duties, ...localDuties];

    return { success: true, data: { duties: combinedDuties } };
  } catch (error) {
    console.error("Error fetching manager ops: ", error);
    
    // एरर आने पर केवल लोकल स्टोरेज का डेटा रिटर्न करें
    const localDuties = JSON.parse(localStorage.getItem('aachico_local_duties') || '[]');
    return { success: true, error: error.message, data: { duties: localDuties } };
  }
}
