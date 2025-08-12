import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Landmark } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex min-h-[80vh]">
          {/* Left Side - Branding (hidden on mobile) */}
          <div className="hidden md:flex flex-1 flex-col justify-center items-center text-white text-center px-8">
            <Landmark className="h-20 w-20 mb-6 opacity-90" />
            <h1 className="text-4xl font-bold mb-4">
              Personal Expense Tracker
            </h1>
            <p className="text-lg opacity-90 max-w-md mb-8">
              Take control of your finances with secure, encrypted expense tracking
            </p>
            <div className="space-y-2 opacity-70">
              <p className="text-sm">✓ AES-256-GCM Encryption</p>
              <p className="text-sm">✓ Real-time Analytics</p>
              <p className="text-sm">✓ Secure OAuth2 Authentication</p>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex-1 flex flex-col justify-center px-4 md:px-8">
            <Card className="md:shadow-2xl bg-white/95 md:bg-white backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                {/* Mobile Logo */}
                <div className="md:hidden text-center mb-6">
                  <Landmark className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h1 className="text-xl font-bold text-primary">
                    Expense Tracker
                  </h1>
                </div>

                {/* Auth Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">{title}</h2>
                  {subtitle && (
                    <p className="text-muted-foreground">{subtitle}</p>
                  )}
                </div>

                {/* Auth Form Content */}
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;