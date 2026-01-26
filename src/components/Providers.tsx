"use client";

import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LoginPage from '@/components/LoginPage';

interface ProvidersProps {
    children: ReactNode;
}

// Inner component that uses auth context
const AuthGate = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <>{children}</>;
};

// Main providers wrapper
export default function Providers({ children }: ProvidersProps) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <AuthGate>{children}</AuthGate>
            </AuthProvider>
        </LanguageProvider>
    );
}
