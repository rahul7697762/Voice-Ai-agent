// This service is responsible for making API calls to your own backend server.
// Your backend server will then securely communicate with the Retell API.
// IMPORTANT: Do NOT call the Retell API directly from the frontend with your API key.

interface CallDetails {
    agentId: string;
    toNumber: string;
    fromNumber: string;
    userId: string;
    callData: Record<string, any>;
}

const makeCall = async (details: CallDetails) => {
    // This is the endpoint on your own backend server that you will create.
    const YOUR_BACKEND_ENDPOINT = '/api/make-call'; 

    const response = await fetch(YOUR_BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(details),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        // Throws an error with the message from the backend, or a default message.
        throw new Error(errorData.message || 'Failed to initiate the call.');
    }

    return await response.json();
};

const retellService = {
    makeCall,
};

export default retellService;
