"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Development preview mode - set to true to bypass auth for UI preview
const PREVIEW_MODE = false; // Set to false to enable real authentication

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPreview] = useState(PREVIEW_MODE);

  useEffect(() => {
    // Skip auth check in preview mode
    if (isPreview) return;
    
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router, isPreview]);

  // In preview mode, show content immediately
  if (isPreview) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

