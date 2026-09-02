// ==========================================================================
// Aachico Vault - Profit & Loss (P&L) and B2B Udhari Ledger Module
// ==========================================================================

import { db } from '../config/firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

/**
 * नया वित्तीय लेन-देन या B2B उधारी दर्ज करना (Income / Expense / Udhari)
 */
export async function recordFinancialTransaction(txnData) {
  try {
    const docRef = await addDoc(collection(db, "financial_ledger"), {
      partyName: txnData.partyName,
      transactionType: txnData.transactionType, // 'Credit' (Income) or 'Debit' (Expense/Udhari)
      amount: Number(txnData.amount) || 0,
      description: txnData.description || "",
      category: txnData.category || "General", // e.g., Fuel, Maintenance, Booking Income, Udhari
      createdAt: serverTimestamp()
    });

    return { success: true, id: docRef.id, message: "लेज़र एंट्री सफलतापूर्वक दर्ज हो गई है!" };
  } catch (error) {
    console.error("Error recording transaction: ", error);
    return { success: false, error: error.message };
  }
}

/**
 * सभी वित्तीय लेज़र और P&L डेटा लोड करना
 */
export async function fetchFinancialLedger() {
  try {
    const q = query(collection(db, "financial_ledger"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    let ledgerList = [];
    let totalIncome = 0;
    let totalExpense = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ledgerList.push({ id: doc.id, ...data });

      if (data.transactionType === "Credit") {
        totalIncome += Number(data.amount) || 0;
      } else {
        totalExpense += Number(data.amount) || 0;
      }
    });

    const netProfitOrLoss = totalIncome - totalExpense;

    return {
      success: true,
      data: ledgerList,
      summary: {
        totalIncome,
        totalExpense,
        netProfitOrLoss
      }
    };
  } catch (error) {
    console.error("Error fetching ledger: ", error);
    return { success: false, error: error.message, data: [], summary: { totalIncome: 0, totalExpense: 0, netProfitOrLoss: 0 } };
  }
}
