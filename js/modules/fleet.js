// ==========================================================================
// Aachico Vault - Fleet Management Module (Add Car & Odometer Tracking)
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * गाड़ी का नंबर ऑटो-फॉर्मेट करने के लिए (जैसे rj27ta8199 -> RJ27TA8199)
 */
export function formatVehicleNumber(input) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * नई गाड़ी को Firestore डेटाबेस में रजिस्टर करना
 */
export async function registerNewVehicle(vehicleData) {
  try {
    const formattedNumber = formatVehicleNumber(vehicleData.vehicleNumber);
    
    const docRef = await addDoc(collection(db, "vehicles"), {
      vehicleNumber: formattedNumber,
      modelName: vehicleData.modelName,
      ownerName: vehicleData.ownerName,
      currentOdometer: Number(vehicleData.currentOdometer) || 0,
      status: "Active",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "गाड़ी सफलतापूर्वक पंजीकृत हो गई है!" };
  } catch (error) {
    console.error("Error adding vehicle: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी रजिस्टर्ड गाड़ियों की सूची लोड करना
 */
export async function fetchAllVehicles() {
  try {
    const q = query(collection(db, "vehicles"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let vehiclesList = [];
    querySnapshot.forEach((doc) => {
      vehiclesList.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: vehiclesList };
  } catch (error) {
    console.error("Error fetching vehicles: ", error);
    return { success: false, error: error.message, data: [] };
  }
}
