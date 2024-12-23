// App.js
import { useState } from 'react';
import EmailCampaignGenerator from './components/EmailCampaignGen';
import './App.css';  // Use this instead of styles.css

export default function App() {
  const [accounts, setAccounts] = useState([
    {
      account_name: '',
      industry: '',
      pain_points: [],
      contacts: [{ name: '', email: '', job_title: '' }],
      campaign_objective: 'awareness',
      interest: '',
      tone: 'neutral',
      language: 'en'
    }
  ]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState('');
  const [error, setError] = useState('');

  const addAccount = () => {
    setAccounts([...accounts, {
      account_name: '',
      industry: '',
      pain_points: [],
      contacts: [{ name: '', email: '', job_title: '' }],
      campaign_objective: 'awareness',
      interest: '',
      tone: 'neutral',
      language: 'en'
    }]);
  };

  const removeAccount = (index) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    setAccounts(updatedAccounts);
  };

  const handleGenerateCampaigns = async (formData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/generate-campaigns/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: [formData],
          number_of_emails: parseInt(formData.numEmails)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data.campaigns);
    } catch (error) {
      setError(`Error generating campaigns: ${error.message}`);
      console.error('Error generating campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async (formData) => {
    try {
      const response = await fetch('http://localhost:8000/export-campaigns-csv/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: [formData],
          number_of_emails: parseInt(formData.numEmails)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `campaigns_${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Error exporting CSV: ${error.message}`);
      console.error('Error exporting CSV:', error);
    }
  };

  const handleGenerateAudio = async (emailBody, language = 'en') => {
    try {
      const response = await fetch('http://localhost:8000/generate-email-audio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email_body: emailBody,
          language: language
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      setAudioSrc(audioUrl);
    } catch (error) {
      setError(`Error generating audio: ${error.message}`);
      console.error('Error generating audio:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Email Campaign Generator</h1>
          <p className="text-gray-600 mt-2">Generate personalized email campaigns with A/B testing</p>
        </div>

        <EmailCampaignGenerator
          isLoading={isLoading}
          onSubmit={handleGenerateCampaigns}
          onExportCSV={handleExportCSV}
          onGenerateAudio={handleGenerateAudio}
          error={error}
          campaigns={campaigns}
          audioSrc={audioSrc}
          onAudioClose={() => setAudioSrc('')}
        />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}