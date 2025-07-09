'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestApiPage() {
  const { data: session } = useSession();
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks-list?email=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      setApiData(data);
      
      // Log the first few tasks to console
      if (data.records && data.records.length > 0) {
        console.log('First task:', data.records[0]);
        console.log('Status object:', data.records[0].status);
        console.log('Stage object:', data.records[0].stage);
        
        // Test our helper functions
        const getStatusValue = (status) => {
          if (typeof status === 'object' && status.value) {
            return status.value.toLowerCase().trim();
          }
          return typeof status === 'string' ? status.toLowerCase().trim() : '';
        };
        
        const getStageValue = (stage) => {
          if (typeof stage === 'object' && stage.value) {
            return stage.value.toLowerCase().trim();
          }
          return typeof stage === 'string' ? stage.toLowerCase().trim() : '';
        };
        
        const statusValue = getStatusValue(data.records[0].status);
        const stageValue = getStageValue(data.records[0].stage);
        
        console.log('Processed status value:', statusValue);
        console.log('Processed stage value:', stageValue);
        
        // Test matching logic
        console.log('Status matches ongoing?', statusValue.includes('on-going'));
        console.log('Stage matches development?', stageValue.includes('development'));
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API</h1>
      
      <div className="mb-4">
        <p>Email: {session?.user?.email || 'Not logged in'}</p>
        <button 
          onClick={testApi}
          disabled={loading || !session?.user?.email}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Test API'}
        </button>
      </div>

      {apiData && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">API Response:</h2>
          <p>Status: {apiData.status}</p>
          <p>Records count: {apiData.records?.length || 0}</p>
          
          {apiData.records && apiData.records.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">First Task:</h3>
              <p>Title: {apiData.records[0].title}</p>
              <p>Status: {JSON.stringify(apiData.records[0].status)}</p>
              <p>Stage: {JSON.stringify(apiData.records[0].stage)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
