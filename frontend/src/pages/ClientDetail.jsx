import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, ExternalLink, Play, Edit2, Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import ScrapesTab from '../components/ClientDetail/ScrapesTab';
import IntelligenceTab from '../components/ClientDetail/IntelligenceTab';
import ContentIdeasTab from '../components/ClientDetail/ContentIdeasTab';
import EmailsTab from '../components/ClientDetail/EmailsTab';
import DeliverySettings from '../components/ClientDetail/DeliverySettings';
import CompetitorUrls from '../components/ClientDetail/CompetitorUrls';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [triggering, setTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState('');
  const [triggerSuccess, setTriggerSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({ status: '', n8n_webhook_url: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [lastScrapeAt, setLastScrapeAt] = useState(null);

  useEffect(() => {
    loadClient();
    loadLastScrape();
  }, [id]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await api.getClient(id);
      setClient(data);
      setEditData({
        status: data.status,
        n8n_webhook_url: data.n8n_webhook_url || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLastScrape = async () => {
    try {
      const scrapes = await api.getClientScrapes(id);
      if (Array.isArray(scrapes) && scrapes.length > 0) {
        const mostRecent = scrapes
          .filter((s) => s.scrape_date)
          .sort((a, b) => new Date(b.scrape_date) - new Date(a.scrape_date))[0];
        if (mostRecent) {
          setLastScrapeAt(mostRecent.scrape_date);
        }
      } else {
        setLastScrapeAt(null);
      }
    } catch (err) {
      // Non-blocking; don't surface error in UI to avoid noise
      console.warn('Unable to load last scrape date', err);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditData({
      status: client.status,
      n8n_webhook_url: client.n8n_webhook_url || '',
    });
    setSaveError('');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditData({
      status: client.status,
      n8n_webhook_url: client.n8n_webhook_url || '',
    });
    setSaveError('');
  };

  const validateUrl = (url) => {
    if (!url) return true; // Empty is allowed
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    setSaveError('');

    // Validate webhook URL if provided
    if (editData.n8n_webhook_url && !validateUrl(editData.n8n_webhook_url)) {
      setSaveError('Please enter a valid webhook URL');
      return;
    }

    setSaving(true);

    try {
      const updated = await api.updateClient(id, {
        status: editData.status,
        n8n_webhook_url: editData.n8n_webhook_url || null,
      });
      setClient(updated);
      setIsEditMode(false);
      // Reload to get updated timestamps
      await loadClient();
    } catch (err) {
      setSaveError(err.message || 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);

    try {
      await api.deleteClient(id);
      navigate('/clients', { state: { message: 'Client deleted successfully' } });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete client');
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (status === 'active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const handleTriggerAutomation = async () => {
    setTriggerError('');
    setTriggerSuccess(false);
    setTriggering(true);

    try {
      await api.triggerClientAutomation(id);
      setTriggerSuccess(true);
      setTimeout(() => setTriggerSuccess(false), 3000);
    } catch (err) {
      setTriggerError(err.message || 'Failed to trigger automation');
    } finally {
      setTriggering(false);
    }
  };

  const canTriggerAutomation = client && client.status === 'active' && client.n8n_webhook_url;

  if (loading) {
    return <div className="text-gray-600">Loading client...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  if (!client) {
    return <div className="text-gray-600">Client not found</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'scrapes', label: 'Scrape History' },
    { id: 'intelligence', label: 'AI Intelligence' },
    { id: 'content-ideas', label: 'Content Ideas' },
    { id: 'emails', label: 'Email Logs' },
  ];

  return (
    <div>
      <Link
        to="/clients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Clients
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{client.name}</h1>
            <a
              href={client.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
            >
              {client.website}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode && (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Client
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Client
                </button>
              </>
            )}
            {isEditMode && (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            {!isEditMode && <span className={getStatusBadge(client.status)}>{client.status}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <div className="text-sm text-gray-500">Created At</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {format(new Date(client.created_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Updated At</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {format(new Date(client.updated_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Automation Settings</h2>
          <div className="space-y-4">
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {saveError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isEditMode ? (
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              ) : (
                <div className="mt-1">
                  <span className={getStatusBadge(client.status)}>{client.status}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                n8n Webhook URL
              </label>
              {isEditMode ? (
                <>
                  <input
                    type="url"
                    value={editData.n8n_webhook_url}
                    onChange={(e) => setEditData({ ...editData, n8n_webhook_url: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-n8n-instance.com/webhook/..."
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave empty to disable automation for this client.</p>
                </>
              ) : (
                <div className="mt-1">
                  {client.n8n_webhook_url ? (
                    <a
                      href={client.n8n_webhook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 break-all"
                    >
                      {client.n8n_webhook_url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">Not configured</span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleTriggerAutomation}
                disabled={!canTriggerAutomation || triggering}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                {triggering ? 'Triggering...' : 'Scrape Website'}
              </button>
              {!canTriggerAutomation && (
                <p className="mt-2 text-sm text-gray-500">
                  {client.status !== 'active' 
                    ? 'Client must be active to trigger automation.'
                    : 'Configure a webhook URL to enable automation.'}
                </p>
              )}
              {canTriggerAutomation && (
                <p className="mt-2 text-sm text-gray-500">
                  This scraping process takes about 10 minutes. You can skip if the last scrape was recent
                  {lastScrapeAt
                    ? ` (last scrape: ${format(new Date(lastScrapeAt), 'MMM d, yyyy h:mm a')})`
                    : ' (no previous scrapes found)' }.
                </p>
              )}
              {triggerError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {triggerError}
                </div>
              )}
              {triggerSuccess && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                  Automation triggered successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <CompetitorUrls clientId={id} />
            <DeliverySettings clientId={id} />
          </div>
        )}
        {activeTab === 'scrapes' && <ScrapesTab clientId={id} />}
        {activeTab === 'intelligence' && <IntelligenceTab clientId={id} />}
        {activeTab === 'content-ideas' && <ContentIdeasTab clientId={id} />}
        {activeTab === 'emails' && <EmailsTab clientId={id} />}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteError('');
        }}
        onConfirm={handleDelete}
        clientName={client?.name}
      />
      {deleteError && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm shadow-lg max-w-md">
          {deleteError}
        </div>
      )}
    </div>
  );
}

