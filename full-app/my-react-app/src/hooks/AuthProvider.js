// src/hooks/AuthProvider.js

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Fetched user data:", userData);
            
            if (userData.role) {
              // Only set the complete user object if profile is complete
              if (userData.isProfileComplete) {
                setUser({ ...currentUser, role: userData.role });
              } else {
                // Set user with incomplete flag - this will trigger the form display
                setUser({ ...currentUser, role: userData.role, isProfileComplete: false });
              }
            } else {
              console.warn("Role is missing in Firestore document:", userData); // Debug: Role missing
              setError("Role is missing in Firestore document");
              setUser({ ...currentUser, role: null });
            }
          } else {
            console.warn("User document does not exist for UID:", currentUser.uid);
            setError("User document does not exist for UID");
            setUser({ ...currentUser, role: null });
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setError("Error fetching user data from Firestore");
          setUser({ ...currentUser, role: null });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const authContextValue = {
    user,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}