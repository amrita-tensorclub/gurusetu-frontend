"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirects to Signup instead of Login
    router.push('/signup');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-[#8C1515] font-bold animate-pulse">
        Joining Guru Setu...
      </div>
    </div>
  );
}