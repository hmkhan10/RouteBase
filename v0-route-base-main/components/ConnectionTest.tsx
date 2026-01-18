'use client';

import { useEffect, useState } from 'react';
import { helloWorld, healthCheck } from '@/lib/api-client';
import type { HelloWorldResponse, HealthCheckResponse } from '@/types/models';

export default function ConnectionTest() {
    const [helloData, setHelloData] = useState<HelloWorldResponse | null>(null);
    const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                setLoading(true);
                setError(null);

                // Test Hello World endpoint
                const hello = await helloWorld();
                setHelloData(hello);

                // Test Health Check endpoint
                const health = await healthCheck();
                setHealthData(health);
            } catch (err) {
                console.error('Connection test failed:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        testConnection();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto my-8">
                <h2 className="text-xl font-bold text-red-800 mb-2">❌ Connection Failed</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <div className="text-sm text-red-700 bg-red-100 p-3 rounded">
                    <strong>Troubleshooting:</strong>
                    <ul className="list-disc ml-5 mt-2">
                        <li>Make sure Django backend is running on port 8000</li>
                        <li>Check CORS configuration in Django settings</li>
                        <li>Verify the API URL in environment variables</li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-8 p-6">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    ✅ Django-Next.js Connection Successful!
                </h1>
                <p className="text-gray-600">
                    Backend and frontend are communicating correctly
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Hello World Response */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">👋</span> Hello World API
                    </h2>
                    {helloData && (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Message:</span>
                                <span className="font-medium text-gray-900">{helloData.message}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Backend:</span>
                                <span className="font-medium text-gray-900">{helloData.backend}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">CORS:</span>
                                <span className="font-medium text-green-600">
                                    {helloData.cors_enabled ? '✓ Enabled' : '✗ Disabled'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Timestamp:</span>
                                <span className="font-medium text-gray-900 text-xs">
                                    {new Date(helloData.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Health Check Response */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💚</span> Health Check
                    </h2>
                    {healthData && (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-medium text-green-600 uppercase">{healthData.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Message:</span>
                                <span className="font-medium text-gray-900">{healthData.message}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Version:</span>
                                <span className="font-medium text-gray-900">{healthData.version}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Technical Details */}
            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🔧 Connection Details</h3>
                <div className="grid gap-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Backend URL:</span>
                        <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                            {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                        </code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Frontend URL:</span>
                        <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">
                            http://localhost:3000
                        </code>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">CORS Status:</span>
                        <span className="text-green-600 font-medium">✓ Configured</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type Safety:</span>
                        <span className="text-blue-600 font-medium">✓ TypeScript Enabled</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
