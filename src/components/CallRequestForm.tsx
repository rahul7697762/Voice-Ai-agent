import React, { useState } from 'react';
import retellService from '../services/retellService';
import { useAuth } from '../contexts/AuthContext';

const CallRequestForm: React.FC = () => {
  const { currentUser, credits, updateCredits } = useAuth();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    callTime: 'Immediately',
    industry: 'Other',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | '', message: string}>({ type: '', message: '' });

  // Retell agent ID
  const AGENT_ID = 'agent_2da0e42e38e963417e9a1c56da';
  const FROM_NUMBER = '+1XXXYYYZZZZ'; // Your Twilio or Retell provisioned number

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setStatus({ type: 'error', message: 'Please sign in to request a call.' });
      return;
    }
    
    if (!formData.phoneNumber) {
      setStatus({ type: 'error', message: 'Phone number is required' });
      return;
    }

    if (credits === 0) {
      setStatus({ type: 'error', message: "You have no credits left. Please upgrade your account." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Format the call data with form information
      const callData = {
        customer_name: formData.fullName || 'Valued Customer',
        call_time: formData.callTime,
        industry: formData.industry,
        message: formData.message,
        // Add any additional data you want to pass to your agent
      };

      const response = await retellService.makeCall({
        agentId: AGENT_ID,
        toNumber: formData.phoneNumber,
        fromNumber: FROM_NUMBER,
        userId: currentUser.uid,
        callData,
      });

      setStatus({
        type: 'success',
        message: `Call requested successfully! We'll call you ${formData.callTime.toLowerCase()}.`
      });
      
      // Reset form after successful submission
      if (formData.callTime === 'Immediately') {
        setFormData({
          phoneNumber: '',
          fullName: '',
          callTime: 'Immediately',
          industry: 'Other',
          message: ''
        });
      }
    } catch (error) {
      console.error('Error requesting call:', error);
      setStatus({
        type: 'error',
        message: 'Failed to request call. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Request an Automated Call</h2>
        {currentUser && (
          <div className="text-lg font-semibold text-gray-700">
            Credits: {credits}
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-6">
        Experience our system firsthand. Enter your details and we'll call you back within minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1234567890 (E.164 format)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={isSubmitting || !currentUser || credits === 0}
          />
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting || !currentUser || credits === 0}
          />
        </div>

        {/* Preferred Call Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={isSubmitting || !currentUser || credits === 0}
                />
                <span className="ml-2 text-sm text-gray-700">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting || !currentUser || credits === 0}
          >
            <option value="Real Estate">Real Estate</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Automotive">Automotive</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            What would you like to learn about?
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us what you'd like to discuss..."
            disabled={isSubmitting || !currentUser || credits === 0}
          />
        </div>

        {/* Status Message */}
        {status.message && (
          <div className={`p-3 rounded-md ${
            status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {status.message}
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !currentUser || credits === 0}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting || !currentUser || credits === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Request Call Now'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CallRequestForm;