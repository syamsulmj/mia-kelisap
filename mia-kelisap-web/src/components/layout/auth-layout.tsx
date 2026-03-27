import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-mono text-4xl font-bold text-primary">MIA KELISAP</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your AI-powered WhatsApp memory</p>
        </div>
        {children}
      </div>
    </div>
  );
}
