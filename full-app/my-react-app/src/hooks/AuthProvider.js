import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Fetched user data:", userData); // Debug: Check retrieved data
            
            // Check if role exists in the document
            if (userData.role) {
              setUser({ ...currentUser, role: userData.role });
            } else {
              console.warn("Role is missing in Firestore document:", userData); // Debug: Role missing
              setUser({ ...currentUser, role: null });
            }
          } else {
            console.warn("User document does not exist for UID:", currentUser.uid);
            setUser({ ...currentUser, role: null });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser({ ...currentUser, role: null });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  
    return unsubscribe;
  }, []);
  

  const value = {
    user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}