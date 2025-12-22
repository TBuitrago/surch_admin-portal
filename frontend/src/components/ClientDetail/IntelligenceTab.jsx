import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { format } from 'date-fns';

export default function IntelligenceTab({ clientId }) {
  const [intelligence, setIntelligence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIntelligence();
  }, [clientId]);

  const loadIntelligence = async () => {
    try {
      setLoading(true);
      // Filter for 'profile' type primarily
      const data = await api.getClientIntelligenceByType(clientId, 'profile');
      setIntelligence(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderIntelligenceContent = (item) => {
    // Try to parse metadata for structured rendering
    let metadata = {};
    try {
      if (typeof item.metadata === 'string') {
        metadata = JSON.parse(item.metadata);
      } else {
        metadata = item.metadata || {};
      }
    } catch (e) {
      // If parsing fails, use empty metadata
    }

    return (
      <div className="space-y-6">
        {/* 1. Client Overview - Always show content field first */}
        {item.content && (
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">Client Overview</h4>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          </div>
        )}

        {/* 2. Services - From metadata */}
        {metadata.services && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Services</h4>
            {Array.isArray(metadata.services) ? (
              <div className="space-y-4">
                {metadata.services.map((service, idx) => (
                  <div key={idx} className="border-l-2 border-blue-500 pl-4">
                    {service.title && (
                      <h5 className="text-sm font-medium text-gray-900 mb-1">{service.title}</h5>
                    )}
                    {service.description && (
                      <p className="text-sm text-gray-700">{service.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{metadata.services}</p>
            )}
          </div>
        )}

        {/* 3. Optional Sections - Value Proposition */}
        {metadata.valueProposition && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Value Proposition</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{metadata.valueProposition}</p>
          </div>
        )}

        {/* 4. Optional Sections - Brand Tone */}
        {metadata.brandTone && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Brand Tone</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{metadata.brandTone}</p>
          </div>
        )}

        {/* 5. Optional Sections - Primary Focus Areas */}
        {metadata.primaryFocusAreas && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Primary Focus Areas</h4>
            {Array.isArray(metadata.primaryFocusAreas) ? (
              <ul className="list-disc list-inside space-y-1">
                {metadata.primaryFocusAreas.map((area, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{area}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{metadata.primaryFocusAreas}</p>
            )}
          </div>
        )}

        {/* 6. Optional Sections - Ideal Content Angles */}
        {metadata.idealContentAngles && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Ideal Content Angles</h4>
            {Array.isArray(metadata.idealContentAngles) ? (
              <ul className="list-disc list-inside space-y-1">
                {metadata.idealContentAngles.map((angle, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{angle}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{metadata.idealContentAngles}</p>
            )}
          </div>
        )}

        {/* Note: Removed metadata.clientDescription as it's redundant with content field */}
      </div>
    );
  };

  if (loading) {
    return <div className="text-gray-600">Loading intelligence...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {intelligence.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No AI intelligence found for this client.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {intelligence.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {item.intelligence_type}
                    </div>
                    {item.version && (
                      <div className="text-xs text-gray-500 mt-1">Version {item.version}</div>
                    )}
                    {item.scrape && (
                      <div className="text-xs text-gray-500 mt-1">
                        From scrape: {format(new Date(item.scrape.scrape_date), 'MMM d, yyyy h:mm a')}
                        {item.scrape_id && (
                          <span className="ml-1 text-gray-400">(ID: {item.scrape_id.substring(0, 8)}...)</span>
                        )}
                      </div>
                    )}
                    {!item.scrape && item.scrape_id && (
                      <div className="text-xs text-gray-500 mt-1">
                        Scrape ID: {item.scrape_id.substring(0, 8)}...
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div className="mt-4">
                  {renderIntelligenceContent(item)}
                </div>
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 mb-2">
                      View Raw Metadata
                    </summary>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">
                      {JSON.stringify(item.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

