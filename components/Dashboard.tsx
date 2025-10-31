import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import CallRequestForm from './CallRequestForm';

const Dashboard: React.FC = () => {
    const { currentUser, credits } = useAuth();

    if (!currentUser) {
        return <div>Loading...</div>; // Or a redirect
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-black dark:text-white">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome, {currentUser.email}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Here's your command center.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                        <CallRequestForm />
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Account Status</h2>
                        <div className="flex items-baseline justify-center text-center p-4 bg-white dark:bg-black rounded-lg">
                            <span className="text-5xl font-extrabold tracking-tight">
                                {credits === null ? '...' : credits}
                            </span>
                            <span className="ml-1 text-xl font-medium text-gray-500 dark:text-gray-400">
                                {credits === 1 ? 'Credit' : 'Credits'}
                            </span>
                        </div>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                            Need more? Contact support to upgrade your plan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
