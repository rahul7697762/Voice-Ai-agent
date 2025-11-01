import React, { useState } from 'react';
import retellService from '../services/retellService';
import { useAuth } from '../contexts/AuthContext';

const countryCodes = [
  { code: '+1', country: 'USA/CAN' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+49', country: 'Germany' },
];

const CallRequestForm: React.FC = () => {
  const { currentUser, credits, updateCredits } = useAuth();
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    callTime: 'Immediately',
    industry: 'Real Estate',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | '', message: string}>({ type: '', message: '' });

  // Retell agent ID - Replace with your actual Agent ID
  const AGENT_ID = 'agent_2da0e42e38e963417e9a1c56da'; 
  // Your provisioned number - Replace with your actual number
  const FROM_NUMBER = '+1(229)458-8054'; 

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Strip all non-digit characters to be more robust
    const numericValue = value.replace(/\D/g, '');
    // Limit to 10 digits
    if (numericValue.length <= 10) {
        setPhoneNumber(numericValue);
        // Clear error as user corrects the input
        if (phoneError && numericValue.length === 10) {
            setPhoneError('');
        }
    }
  };

  const validatePhoneNumber = (): boolean => {
    if (!phoneNumber.trim()) {
        setPhoneError('Phone number is required.');
        return false;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
        setPhoneError('Please enter a valid 10-digit phone number.');
        return false;
    }
    setPhoneError('');
    return true;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    // Use new validation function
    if (!validatePhoneNumber()) {
        return;
    }

    if (!currentUser) {
      setStatus({ type: 'error', message: 'Please sign in to request a call.' });
      return;
    }

    if (credits === null || credits <= 0) {
      setStatus({ type: 'error', message: "You have no credits left. Please upgrade your account." });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;
      const callData = {
        customer_name: formData.fullName || 'Valued Customer',
        call_time: formData.callTime,
        industry: formData.industry,
        message: formData.message,
      };

      // This is a call to your backend, which will then securely call the Retell API
      await retellService.makeCall({
        agentId: AGENT_ID,
        toNumber: fullPhoneNumber,
        fromNumber: FROM_NUMBER,
        userId: currentUser.uid,
        callData,
      });

      // Deduct credit on successful API call
      const newCredits = credits - 1;
      await updateCredits(newCredits);

      setStatus({
        type: 'success',
        message: `Call requested successfully! We'll call you ${formData.callTime.toLowerCase()}.`
      });
      
      // Reset form after successful submission
      setPhoneNumber('');
      setFormData({
        fullName: '',
        callTime: 'Immediately',
        industry: 'Real Estate',
        message: ''
      });
      
    } catch (error) {
      console.error('Error requesting call:', error);
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to request call. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting && currentUser && credits !== null && credits > 0;

  return (
    <div className="w-full mx-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-800 text-black dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Request an Automated Call</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Experience our system firsthand. Enter your details and we'll call you back. This will use one credit.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <select
                id="countryCode"
                name="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                disabled={!canSubmit}
                aria-label="Country Code"
            >
                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.country} ({c.code})</option>)}
            </select>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              onBlur={validatePhoneNumber}
              placeholder="10-digit number"
              className={`w-full px-4 py-2 border rounded-r-md focus:ring-2 dark:bg-gray-800 dark:text-white ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-black'}`}
              required
              disabled={!canSubmit}
              aria-invalid={!!phoneError}
              aria-describedby="phone-error"
            />
          </div>
           {phoneError && <p id="phone-error" className="mt-2 text-sm text-red-600 dark:text-red-400">{phoneError}</p>}
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleFormDataChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            disabled={!canSubmit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preferred Call Time
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Immediately', 'Within 1 hour', 'Within 4 hours', 'Tomorrow'].map((time) => (
              <label key={time} className="flex items-center">
                <input
                  type="radio"
                  name="callTime"
                  value={time}
                  checked={formData.callTime === time}
                  onChange={handleFormDataChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                  disabled={!canSubmit}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{time}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleFormDataChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            disabled={!canSubmit}
          >
            <option>Real Estate</option>
            <option>E-commerce</option>
            <option>Healthcare</option>
            <option>Education</option>
            <option>Automotive</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            What would you like to learn about?
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleFormDataChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="Tell us what you'd like to discuss..."
            disabled={!canSubmit}
          />
        </div>

        {status.message && (
          <div className={`p-3 rounded-md text-sm ${
            status.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            {status.message}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Request Call Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CallRequestForm;