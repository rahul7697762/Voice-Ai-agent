import Retell from 'retell-sdk';
import { db } from "../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

// Initialize the Retell client with API key from environment variables
const apiKey = import.meta.env.VITE_RETELL_API_KEY || '';

if (!apiKey) {
  console.warn('Retell API key not found. Please set VITE_RETELL_API_KEY in your .env file');
}

const retellClient = new Retell({
  apiKey,
  // Optional: Configure retries and timeouts
  maxRetries: 2,
  timeout: 60 * 1000, // 1 minute
});

type LanguageCode = 'en-US' | 'en-GB' | 'es-ES' | 'fr-FR' | 'de-DE' | 'it-IT' | 'pt-BR' | 'ja-JP' | 'ko-KR' | 'zh-CN' | 'hi-IN';

interface CreateAgentOptions {
  llmId: string;
  voiceId: string;
  agentName?: string;
  language?: LanguageCode;
  prompt?: string;
  firstSentence?: string;
}

interface CallOptions {
  agentId: string;
  toNumber: string;
  fromNumber?: string;
  callData?: Record<string, any>;
  userId: string;
}

export const retellService = {
  /**
   * Create a new Retell agent
   */
  async createAgent(options: CreateAgentOptions) {
    try {
      // Create agent with minimal required fields
      const params: any = {
        voice_id: options.voiceId,
        ...(options.agentName && { agent_name: options.agentName }),
        ...(options.language && { language: options.language }),
        ...(options.prompt && { prompt: options.prompt }),
        ...(options.firstSentence && { first_sentence: options.firstSentence }),
      };
      
      // Add LLM configuration if provided
      if (options.llmId) {
        params.llm_websocket_url = `wss://api.retellai.com/llm/${options.llmId}`;
      }
      
      const response = await retellClient.agent.create(params);
      return response;
    } catch (error) {
      console.error('Error creating Retell agent:', error);
      throw error;
    }
  },

  /**
   * Make a phone call using Retell
   */
  async makeCall(options: CallOptions & { customerData?: Record<string, any> }) {
    try {
      const userDocRef = doc(db, "users", options.userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || userDoc.data().credits <= 0) {
        throw new Error("Insufficient credits. Please upgrade your plan.");
      }

      console.log('Initiating call with options:', {
        toNumber: options.toNumber,
        customerData: options.customerData
      });

      const response = await fetch('https://api.retellai.com/v2/create-phone-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from_number: '+12294588054',
          to_number: options.toNumber,
          override_agent_id: 'agent_2da0e42e38e963417e9a1c56da',
          retell_llm_dynamic_variables: {
            customer_name: options.customerData?.name || 'Valued Customer',
            location: options.customerData?.location || 'Unknown',
            property_type: options.customerData?.propertyType || 'Not specified',
            budget: options.customerData?.budget || 'Not specified'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }

      await updateDoc(userDocRef, {
        credits: increment(-1),
      });

      const responseData = await response.json();
      console.log('Call initiated successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error making call with Retell:', {
        error,
        message: error.message,
        status: error.status,
        response: error.response?.data,
      });
      throw new Error(`Failed to initiate call: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * List all available voices
   */
  async listVoices() {
    try {
      const response = await retellClient.voice.list();
      return response;
    } catch (error) {
      console.error('Error listing voices:', error);
      throw error;
    }
  },

  /**
   * Get call details
   */
  async getCallDetails(callId: string) {
    try {
      const response = await retellClient.call.retrieve(callId);
      return response;
    } catch (error) {
      console.error('Error getting call details:', error);
      throw error;
    }
  },

  /**
   * End an ongoing call
   */
  async endCall(callId: string) {
    try {
      // Note: The actual method might be different based on the SDK version
      // This is a placeholder - check the SDK documentation for the correct method
      const response = await (retellClient.call as any).end(callId);
      return response;
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  },
};

export default retellService;