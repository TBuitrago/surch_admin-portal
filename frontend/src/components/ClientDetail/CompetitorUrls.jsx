import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, X, Save, Edit2, ExternalLink } from 'lucide-react';

export default function CompetitorUrls({ clientId }) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Form state
  const [instagramUrls, setInstagramUrls] = useState(['']);
  const [tiktokUrls, setTiktokUrls] = useState(['']);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    try {
      setLoading(true);
      const data = await api.getClient(clientId);
      setClient(data);
      
      // Initialize URLs from client data
      const instagram = data.competitor_instagram_urls || [];
      const tiktok = data.competitor_tiktok_urls || [];
      
      setInstagramUrls(instagram.length > 0 ? [...instagram, ''] : ['']);
      setTiktokUrls(tiktok.length > 0 ? [...tiktok, ''] : ['']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url, platform) => {
    if (!url || url.trim() === '') return true; // Empty is allowed
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (platform === 'instagram') {
        return hostname.includes('instagram.com');
      } else if (platform === 'tiktok') {
        return hostname.includes('tiktok.com');
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = (platform) => {
    if (platform === 'instagram') {
      if (instagramUrls.length < 5) {
        setInstagramUrls([...instagramUrls, '']);
      }
    } else if (platform === 'tiktok') {
      if (tiktokUrls.length < 5) {
        setTiktokUrls([...tiktokUrls, '']);
      }
    }
  };

  const handleRemoveUrl = (platform, index) => {
    if (platform === 'instagram') {
      if (instagramUrls.length > 1) {
        const newUrls = instagramUrls.filter((_, i) => i !== index);
        setInstagramUrls(newUrls);
      }
    } else if (platform === 'tiktok') {
      if (tiktokUrls.length > 1) {
        const newUrls = tiktokUrls.filter((_, i) => i !== index);
        setTiktokUrls(newUrls);
      }
    }
  };

  const handleUrlChange = (platform, index, value) => {
    if (platform === 'instagram') {
      const newUrls = [...instagramUrls];
      newUrls[index] = value;
      setInstagramUrls(newUrls);
    } else if (platform === 'tiktok') {
      const newUrls = [...tiktokUrls];
      newUrls[index] = value;
      setTiktokUrls(newUrls);
    }
  };

  const handleSave = async () => {
    setSaveError('');

    // Filter out empty URLs and validate
    const validInstagram = instagramUrls
      .filter(url => url && url.trim() !== '')
      .map(url => url.trim());
    const validTiktok = tiktokUrls
      .filter(url => url && url.trim() !== '')
      .map(url => url.trim());

    // Validate all URLs
    for (const url of validInstagram) {
      if (!validateUrl(url, 'instagram')) {
        setSaveError('Please enter valid Instagram URLs (must include instagram.com)');
        return;
      }
    }

    for (const url of validTiktok) {
      if (!validateUrl(url, 'tiktok')) {
        setSaveError('Please enter valid TikTok URLs (must include tiktok.com)');
        return;
      }
    }

    // Validate count limits
    if (validInstagram.length > 5) {
      setSaveError('Maximum 5 Instagram URLs allowed');
      return;
    }

    if (validTiktok.length > 5) {
      setSaveError('Maximum 5 TikTok URLs allowed');
      return;
    }

    setSaving(true);

    try {
      await api.updateClientCompetitorUrls(clientId, {
        competitor_instagram_urls: validInstagram,
        competitor_tiktok_urls: validTiktok,
      });
      
      setIsEditMode(false);
      await loadClient();
    } catch (err) {
      setSaveError(err.message || 'Failed to save competitor URLs');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    const instagram = client?.competitor_instagram_urls || [];
    const tiktok = client?.competitor_tiktok_urls || [];
    
    setInstagramUrls(instagram.length > 0 ? [...instagram, ''] : ['']);
    setTiktokUrls(tiktok.length > 0 ? [...tiktok, ''] : ['']);
    setIsEditMode(false);
    setSaveError('');
  };

  const renderUrlSection = (platform, urls, setUrls) => {
    const platformName = platform === 'instagram' ? 'Instagram' : 'TikTok';
    const validUrls = urls.filter(url => url && url.trim() !== '');
    const canAddMore = urls.length < 5;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {platformName} URLs
          </label>
          {isEditMode && canAddMore && (
            <button
              type="button"
              onClick={() => handleAddUrl(platform)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </button>
          )}
        </div>

        {isEditMode ? (
          <div className="space-y-2">
            {urls.map((url, index) => {
              const isValid = !url || url.trim() === '' || validateUrl(url, platform);
              return (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(platform, index, e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={`https://${platform === 'instagram' ? 'www.instagram.com' : 'www.tiktok.com'}/...`}
                    />
                    {!isValid && url.trim() !== '' && (
                      <p className="mt-1 text-xs text-red-600">
                        Invalid {platformName} URL format
                      </p>
                    )}
                  </div>
                  {urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(platform, index)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors mt-0.5"
                      title="Remove URL"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
            {!canAddMore && (
              <p className="text-xs text-gray-500">Maximum 5 URLs reached</p>
            )}
          </div>
        ) : (
          <div>
            {validUrls.length > 0 ? (
              <div className="space-y-1.5">
                {validUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No {platformName} URLs configured</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-gray-600 text-sm">Loading competitor URLs...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Competitor URLs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage competitor Instagram and TikTok URLs for analysis (up to 5 per platform).
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
        {/* Instagram URLs */}
        <div className="pb-6 border-b border-gray-200">
          {renderUrlSection('instagram', instagramUrls, setInstagramUrls)}
        </div>

        {/* TikTok URLs */}
        <div>
          {renderUrlSection('tiktok', tiktokUrls, setTiktokUrls)}
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

