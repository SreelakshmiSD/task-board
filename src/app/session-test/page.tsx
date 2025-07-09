'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

export default function SessionTestPage() {
  const { data: session, status } = useSession();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Session Test</h1>
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Session Status:</h2>
        <p>Status: {status}</p>
        <p>Email: {session?.user?.email || 'Not available'}</p>
        <p>Name: {session?.user?.name || 'Not available'}</p>
        
        <h3 className="font-bold mt-4 mb-2">Full Session Object:</h3>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-96">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
