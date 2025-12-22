import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewClient() {
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    status: 'active',
    n8n_webhook_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateUrl = (url) => {
    if (!url) return true; // Empty is allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate webhook URL if provided
    if (formData.n8n_webhook_url && !validateUrl(formData.n8n_webhook_url)) {
      setError('Please enter a valid webhook URL');
      return;
    }

    setLoading(true);

    try {
      await api.createClient(formData);
      navigate('/clients');
    } catch (err) {
      setError(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Client</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website <span className="text-red-500">*</span>
            </label>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
            <p className="mt-1 text-sm text-gray-500">Must be unique</p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label htmlFor="n8n_webhook_url" className="block text-sm font-medium text-gray-700 mb-1">
              n8n Webhook URL
            </label>
            <input
              id="n8n_webhook_url"
              type="url"
              value={formData.n8n_webhook_url}
              onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://your-n8n-instance.com/webhook/..."
            />
            <p className="mt-1 text-sm text-gray-500">Optional. Leave empty to disable automation for this client.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
            <Link
              to="/clients"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

