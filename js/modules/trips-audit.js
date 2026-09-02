// ==========================================================================
// Aachico Vault - Trip Audit & Anti-Theft Mileage Calculator Module
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * नई ट्रिप एंट्री दर्ज करना (एंटी-थ्रिफ्ट ओडोमीटर ऑडिट के साथ)
 */
export async function submitTripAudit(tripData) {
  try {
    const startKm = Number(tripData.startKm) || 0;
    const endKm = Number(tripData.endKm) || 0;
    const totalKm = endKm - startKm;

    if (totalKm < 0) {
      return { success: false, error: "समापन KM (End KM), प्रारंभिक KM (Start KM) से कम नहीं हो सकता!" };
    }

    const docRef = await addDoc(collection(db, "trips"), {
      vehicleNumber: tripData.vehicleNumber,
      driverName: tripData.driverName,
      startKm: startKm,
      endKm: endKm,
      totalKm: totalKm,
      fuelUsed: Number(tripData.fuelUsed) || 0,
      mileage: tripData.fuelUsed > 0 ? (totalKm / Number(tripData.fuelUsed)).toFixed(2) : 0,
      clientName: tripData.clientName,
      status: "Pending Approval", // Anti-theft audit status
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "ट्रिप ऑडिट सफलतापूर्वक सबमिट हो गई है!" };
  } catch (error) {
    console.error("Error submitting trip: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी ट्रिप्स की सूची लोड करना
 */
export async function fetchAllTrips() {
  try {
    const q = query(collection(db, "trips"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let tripsList = [];
    querySnapshot.forEach((doc) => {
      tripsList.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: tripsList };
  } catch (error) {
    console.error("Error fetching trips: ", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * ट्रिप को एडमिन द्वारा अप्रूव या रिजेक्ट करना
 */
export async function updateTripAuditStatus(tripId, newStatus) {
  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, { status: newStatus });
    return { success: true, message: `ट्रिप स्थिति बदलकर '${newStatus}' कर दी गई है!` };
  } catch (error) {
    console.error("Error updating trip status: ", error);
    return { success: false, error: error.message };
  }
}
