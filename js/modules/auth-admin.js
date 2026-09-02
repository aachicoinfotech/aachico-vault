// ==========================================================================
// Aachico Vault - Admin & Manager Authentication & Session Management
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * एडमिन या मैनेजर लॉगिन वेरीफाई करना
 */
export async function authenticateAdminOrManager(email, password, role) {
  try {
    // Firestore से एडमिन/मैनेजर क्रेडेंशियल्स की जांच
    const q = query(
      collection(db, "users"), 
      where("email", "==", email),
      where("role", "==", role)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // यदि डेटाबेस में यूजर नहीं है, तो डिफॉल्ट मास्टर एडमिन चेक करें (Fallback for emergency)
      if (email === "admin@aachico.com" && password === "Aachico@2026" && role === "admin") {
        const sessionData = { email, role, loggedInAt: new Date().toISOString() };
        localStorage.setItem("aachico_admin_session", JSON.stringify(sessionData));
        return { success: true, message: "मास्टर एडमिन लॉगिन सफल!" };
      }
      return { success: false, error: "अमान्य ईमेल या पासवर्ड!" };
    }

    let userValid = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.password === password) {
        userValid = true;
        const sessionData = { email: data.email, role: data.role, name: data.fullName, loggedInAt: new Date().toISOString() };
        localStorage.setItem("aachico_admin_session", JSON.stringify(sessionData));
      }
    });

    if (userValid) {
      return { success: true, message: "लॉगिन सफल रहा!" };
    } else {
      return { success: false, error: "गलत पासवर्ड दर्ज किया गया है!" };
    }
  } catch (error) {
    console.error("Authentication error: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * चेक करना कि एडमिन लॉगिन है या नहीं
 */
export function checkAdminSession() {
  const session = localStorage.getItem("aachico_admin_session");
  if (!session) {
    return null;
  }
  return JSON.parse(session);
}

/**
 * एडमिन लॉगआउट करना
 */
export function adminLogout() {
  localStorage.removeItem("aachico_admin_session");
  window.location.href = "admin.html";
}
