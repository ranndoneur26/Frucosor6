"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditService } from '@/lib/audit-service';

// User configuration
const USERS = {
    ignasi: {
        password: 'Longaron',
        maxWeeklyAccess: 5,
    },
    xicola: {
        password: 'llosc',
        maxWeeklyAccess: Infinity,
    },
};

interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
    weeklyAccessCount: number;
    maxWeeklyAccess: number;
    weekStartTimestamp: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    weeklyAccessCount: number;
    maxWeeklyAccess: number;
    remainingAccess: number;
    login: (username: string, password: string) => { success: boolean; error?: string };
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'frucsor_auth';

// Get the start of the current week (Monday)
const getWeekStart = (): number => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        username: null,
        weeklyAccessCount: 0,
        maxWeeklyAccess: 0,
        weekStartTimestamp: getWeekStart(),
    });
    const [isInitialized, setIsInitialized] = useState(false);

    // Load auth state from localStorage on mount
    useEffect(() => {
        const savedAuth = localStorage.getItem(STORAGE_KEY);
        if (savedAuth) {
            try {
                const parsed: AuthState = JSON.parse(savedAuth);
                const currentWeekStart = getWeekStart();

                // Check if we're in a new week - reset access count if so
                if (parsed.weekStartTimestamp < currentWeekStart) {
                    // New week, reset count but keep auth
                    setAuthState({
                        ...parsed,
                        weeklyAccessCount: 0,
                        weekStartTimestamp: currentWeekStart,
                    });
                } else {
                    setAuthState(parsed);
                }
            } catch {
                // Invalid stored data, ignore
            }
        }
        setIsInitialized(true);
    }, []);

    // Save auth state to localStorage when it changes
    useEffect(() => {
        if (isInitialized && authState.isAuthenticated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
        }
    }, [authState, isInitialized]);

    // Auto-logout functionality
    useEffect(() => {
        if (!authState.isAuthenticated) return;

        const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                AuditService.logAction(authState.username || 'unknown', 'AUTO_LOGOUT', 'Session timed out due to inactivity');
                logout();
                alert('Session expired due to inactivity.');
            }, TIMEOUT_MS);
        };

        // Events to monitor
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Initial set
        resetTimer();

        // Add listeners
        events.forEach(event => document.addEventListener(event, resetTimer));

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [authState.isAuthenticated, authState.username]);

    const login = (username: string, password: string): { success: boolean; error?: string } => {
        const normalizedUsername = username.toLowerCase();
        const user = USERS[normalizedUsername as keyof typeof USERS];

        // Check if user exists
        if (!user) {
            AuditService.logAction(username, 'LOGIN_FAILED', 'User not found');
            return { success: false, error: 'login.error.invalid' };
        }

        // Check password
        if (user.password !== password) {
            AuditService.logAction(username, 'LOGIN_FAILED', 'Invalid password');
            return { success: false, error: 'login.error.invalid' };
        }

        const currentWeekStart = getWeekStart();

        // Load existing access count for this user
        const savedAuth = localStorage.getItem(STORAGE_KEY);
        let currentAccessCount = 0;

        if (savedAuth) {
            try {
                const parsed: AuthState = JSON.parse(savedAuth);
                if (parsed.username === normalizedUsername && parsed.weekStartTimestamp >= currentWeekStart) {
                    currentAccessCount = parsed.weeklyAccessCount;
                }
            } catch {
                // Ignore
            }
        }

        // Check access limit
        if (currentAccessCount >= user.maxWeeklyAccess) {
            AuditService.logAction(username, 'LOGIN_DENIED', 'Weekly access limit reached');
            return { success: false, error: 'login.error.limit' };
        }

        // Successful login - increment access count
        const newState: AuthState = {
            isAuthenticated: true,
            username: normalizedUsername,
            weeklyAccessCount: currentAccessCount + 1,
            maxWeeklyAccess: user.maxWeeklyAccess,
            weekStartTimestamp: currentWeekStart,
        };

        setAuthState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

        AuditService.logAction(normalizedUsername, 'LOGIN_SUCCESS', 'User logged in successfully');

        return { success: true };
    };

    const logout = () => {
        if (authState.username) {
            AuditService.logAction(authState.username, 'LOGOUT', 'User logged out');
        }
        setAuthState({
            isAuthenticated: false,
            username: null,
            weeklyAccessCount: 0,
            maxWeeklyAccess: 0,
            weekStartTimestamp: getWeekStart(),
        });
        localStorage.removeItem(STORAGE_KEY);
    };

    const remainingAccess = authState.maxWeeklyAccess === Infinity
        ? Infinity
        : authState.maxWeeklyAccess - authState.weeklyAccessCount;

    if (!isInitialized) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: authState.isAuthenticated,
                username: authState.username,
                weeklyAccessCount: authState.weeklyAccessCount,
                maxWeeklyAccess: authState.maxWeeklyAccess,
                remainingAccess,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
