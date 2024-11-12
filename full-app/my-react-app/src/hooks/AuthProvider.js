import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../config/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore"; // Import Firebase Firestore functions
import { db } from "../config/firebaseConfig"; // Assuming you have initialized Firestore

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);  // To hold the user object and role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // If a user is logged in, fetch their role from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);  // Assuming user role is stored in Firestore in a 'users' collection
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // Set user role from Firestore data
            setUser({ ...currentUser, role: userDoc.data().role });
          } else {
            setUser({ ...currentUser, role: null }); // In case no role is found
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser({ ...currentUser, role: null });
        }
      } else {
        // No user is logged in
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
