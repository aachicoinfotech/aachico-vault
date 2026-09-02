// ==========================================================================
// Aachico Vault - Drivers Management Module (Onboarding, Salary & PIN Security)
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * नए ड्राइवर को रजिस्टर करना (नाम, फोन, सैलरी और 4-डिजिट पिन के साथ)
 */
export async function registerNewDriver(driverData) {
  try {
    const docRef = await addDoc(collection(db, "drivers"), {
      fullName: driverData.fullName,
      phoneNumber: driverData.phoneNumber,
      monthlySalary: Number(driverData.monthlySalary) || 0,
      driverPin: String(driverData.driverPin), // 4-Digit Security PIN
      status: "Active",
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "ड्राइवर सफलतापूर्वक पंजीकृत हो गया है!" };
  } catch (error) {
    console.error("Error adding driver: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी रजिस्टर्ड ड्राइवरों की सूची लोड करना
 */
export async function fetchAllDrivers() {
  try {
    const q = query(collection(db, "drivers"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let driversList = [];
    querySnapshot.forEach((doc) => {
      driversList.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: driversList };
  } catch (error) {
    console.error("Error fetching drivers: ", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * ड्राइवर पिन ऑथेंटिकेशन चेक करने के लिए
 */
export function verifyDriverPin(inputPin, storedPin) {
  return String(inputPin) === String(storedPin);
}
