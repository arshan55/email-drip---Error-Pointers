// src/components/EmailCampaignGenerator/index.jsx
import { useState } from 'react';
import { Download, Volume2, Send } from 'lucide-react';
import './styles.css';

export default function EmailCampaignGenerator() {
  const [formData, setFormData] = useState({
    accountName: '',
    industry: '',
    painPoints: '',
    contacts: '',
    campaignObjective: 'awareness',
    interest: '',
    tone: 'formal',
    language: '',
    numEmails: 1
  });
  
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [campaignData, setCampaignData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const requestBody = {
        accounts: [{
          account_name: formData.accountName,
          industry: formData.industry,
          pain_points: formData.painPoints.split(',').map(p => p.trim()),
          contacts: formData.contacts.split(',').map(contact => ({
            name: contact.trim(),
            email: `${contact.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
            job_title: "Marketing Manager"
          })),
          campaign_objective: formData.campaignObjective,
          interest: formData.interest,
          tone: formData.tone,
          language: formData.language
        }],
        number_of_emails: parseInt(formData.numEmails)
      };

      const response = await fetch('http://localhost:8080/generate-campaigns/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) throw new Error('Failed to generate campaign');
      
      const data = await response.json();
      setCampaignData(data);
      setOutput(formatCampaignOutput(data));
    } catch (error) {
      setError(`Error: ${error.message}`);
      setOutput('');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await fetch('http://localhost:8080/export-campaigns-csv/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accounts: [{
            account_name: formData.accountName,
            industry: formData.industry,
            pain_points: formData.painPoints.split(','),
            contacts: formData.contacts.split(',').map(contact => ({
              name: contact,
              email: `${contact.toLowerCase().replace(/\s+/g, '.')}@example.com`,
              job_title: "Marketing Manager"
            })),
            campaign_objective: formData.campaignObjective,
            interest: formData.interest,
            tone: formData.tone,
            language: formData.language
          }],
          number_of_emails: parseInt(formData.numEmails)
        })
      });

      if (!response.ok) throw new Error('Failed to download CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'campaign.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Error downloading CSV: ${error.message}`);
    }
  };

  const textToSpeech = async () => {
    if (!campaignData?.campaigns[0]?.emails[0]?.variants[0]?.body) {
      setError('No email content available for text-to-speech');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/generate-email-audio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_body: campaignData.campaigns[0].emails[0].variants[0].body,
          language: formData.language || 'en'
        })
      });

      if (!response.ok) throw new Error('Failed to generate audio');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      setError(`Error generating audio: ${error.message}`);
    }
  };

  const formatCampaignOutput = (data) => {
    if (!data.campaigns?.length) return 'No campaign data available';
    
    const campaign = data.campaigns[0];
    let output = `Campaign Generated:\n\n`;
    output += `Account: ${campaign.account_name}\n`;
    
    campaign.emails.forEach((email, idx) => {
      output += `\nEmail ${idx + 1}:\n`;
      email.variants.forEach((variant, vIdx) => {
        output += `\nVariant ${vIdx + 1}:\n`;
        output += `Subject: ${variant.subject}\n`;
        output += `Body: ${variant.body}\n`;
        output += `Call to Action: ${variant.call_to_action}\n`;
        output += `Send Time: ${variant.suggested_send_time}\n`;
      });
    });
    
    return output;
  };

  return (
    <div className="campaign-container">
      <div className="campaign-card">
        <h1 className="campaign-title">Email Campaign Generator</h1>
        
        <form onSubmit={handleSubmit} className="campaign-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Account Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Pain Points (comma separated)</label>
              <textarea
                value={formData.painPoints}
                onChange={(e) => setFormData({...formData, painPoints: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Contacts (comma separated)</label>
              <textarea
                value={formData.contacts}
                onChange={(e) => setFormData({...formData, contacts: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Campaign Objective</label>
              <select
                value={formData.campaignObjective}
                onChange={(e) => setFormData({...formData, campaignObjective: e.target.value})}
              >
                <option value="awareness">Awareness</option>
                <option value="nurturing">Nurturing</option>
                <option value="upselling">Upselling</option>
              </select>
            </div>

            <div className="form-group">
              <label>Interest</label>
              <input
                type="text"
                value={formData.interest}
                onChange={(e) => setFormData({...formData, interest: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Tone</label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Number of Emails</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.numEmails}
                onChange={(e) => setFormData({...formData, numEmails: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="button-group">
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              <Send size={16} />
              {isLoading ? 'Generating...' : 'Generate Campaign'}
            </button>
            
            <button
              type="button"
              onClick={downloadCSV}
              disabled={!campaignData}
              className="btn btn-secondary"
            >
              <Download size={16} />
              Download CSV
            </button>
            
            <button
              type="button"
              onClick={textToSpeech}
              disabled={!campaignData}
              className="btn btn-secondary"
            >
              <Volume2 size={16} />
              Text to Speech
            </button>
          </div>
        </form>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        {output && (
          <div className="output-card">
            <pre>{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}