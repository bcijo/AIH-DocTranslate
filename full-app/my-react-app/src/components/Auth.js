// src/components/Auth.js
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Auth = () => {
    const { login, logout, user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await login(email, password);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div>
            {user ? (
                <div>
                    <p>Welcome, {user.email}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button onClick={handleLogin}>Login</button>
                </div>
            )}
        </div>
    );
};

export default Auth;