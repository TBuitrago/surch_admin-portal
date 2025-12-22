import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { format } from 'date-fns';
import { Mail, Plus, X, Save, Edit2 } from 'lucide-react';

export default function DeliverySettings({ clientId }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Form state
  const [recipients, setRecipients] = useState(['']);
  const [frequency, setFrequency] = useState('weekly');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [clientId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getDeliverySettings(clientId);
      
      if (data) {
        setSettings(data);
        setRecipients(data.recipients && data.recipients.length > 0 
          ? [...data.recipients, ''] 
          : ['']);
        setFrequency(data.frequency || 'weekly');
        setIsActive(data.is_active !== undefined ? data.is_active : true);
      } else {
        // No settings exist, use defaults
        setSettings(null);
        setRecipients(['']);
        setFrequency('weekly');
        setIsActive(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = () => {
    if (recipients.length < 5) {
      setRecipients([...recipients, '']);
    }
  };

  const handleRemoveRecipient = (index) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
    }
  };

  const handleRecipientChange = (index, value) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
  };

  const handleSave = async () => {
    setSaveError('');
    
    // Filter out empty recipients
    const validRecipients = recipients.filter(email => email && email.trim() !== '');
    
    // Validate recipients count
    if (validRecipients.length === 0) {
      setSaveError('At least one recipient email is required');
      return;
    }

    if (validRecipients.length > 5) {
      setSaveError('Maximum 5 recipients allowed');
      return;
    }

    setSaving(true);

    try {
      const updated = await api.updateDeliverySettings(clientId, {
        recipients: validRecipients,
        frequency,
        is_active: isActive,
      });
      
      setSettings(updated);
      setIsEditMode(false);
      // Reload to get updated data
      await loadSettings();
    } catch (err) {
      setSaveError(err.message || 'Failed to save delivery settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (settings) {
      setRecipients(settings.recipients && settings.recipients.length > 0 
        ? [...settings.recipients, ''] 
        : ['']);
      setFrequency(settings.frequency || 'weekly');
      setIsActive(settings.is_active !== undefined ? settings.is_active : true);
    } else {
      setRecipients(['']);
      setFrequency('weekly');
      setIsActive(true);
    }
    setIsEditMode(false);
    setSaveError('');
  };

  if (loading) {
    return <div className="text-gray-600">Loading delivery settings...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  const validRecipients = recipients.filter(email => email && email.trim() !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Delivery Settings</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure where and how often content ideas are delivered to this client.
          </p>
        </div>
        {!isEditMode && (
          <button
            onClick={() => setIsEditMode(true)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {saveError}
        </div>
      )}

      <div className="space-y-6">
        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          {isEditMode ? (
            <div className="space-y-2">
              {recipients.map((email, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleRecipientChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {recipients.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipient
                </button>
              )}
              {recipients.length >= 5 && (
                <p className="text-xs text-gray-500">Maximum 5 recipients reached</p>
              )}
            </div>
          ) : (
            <div>
              {validRecipients.length > 0 ? (
                <div className="space-y-1">
                  {validRecipients.map((email, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {email}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recipients configured yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Delivery Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery frequency
          </label>
          {isEditMode ? (
            <div>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Content ideas will be generated and sent automatically based on this schedule.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-900 capitalize">{frequency}</p>
              <p className="mt-1 text-xs text-gray-500">
                Content ideas will be generated and sent automatically based on this schedule.
              </p>
            </div>
          )}
        </div>

        {/* Delivery Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery status
          </label>
          {isEditMode ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                {isActive ? 'Active' : 'Paused'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                settings?.is_active !== false
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {settings?.is_active !== false ? 'Active' : 'Paused'}
              </span>
            </div>
          )}
        </div>

        {/* Last Sent (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last sent
          </label>
          <p className="text-sm text-gray-900">
            {settings?.last_sent_at
              ? format(new Date(settings.last_sent_at), 'MMM d, yyyy h:mm a')
              : 'Never'}
          </p>
        </div>

        {/* Action Buttons */}
        {isEditMode && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

