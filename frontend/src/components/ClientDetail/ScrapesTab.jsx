import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Brain } from 'lucide-react';

export default function ScrapesTab({ clientId }) {
  const [scrapes, setScrapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [intelligenceByScrape, setIntelligenceByScrape] = useState({});
  const [loadingIntelligence, setLoadingIntelligence] = useState({});

  useEffect(() => {
    loadScrapes();
  }, [clientId]);

  const loadScrapes = async () => {
    try {
      setLoading(true);
      const data = await api.getClientScrapes(clientId);
      setScrapes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id) => {
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);

    // Load intelligence when expanding if not already loaded
    if (newExpandedId && !intelligenceByScrape[newExpandedId] && !loadingIntelligence[newExpandedId]) {
      setLoadingIntelligence({ ...loadingIntelligence, [newExpandedId]: true });
      try {
        const intelligence = await api.getScrapeIntelligence(newExpandedId);
        setIntelligenceByScrape({ ...intelligenceByScrape, [newExpandedId]: intelligence });
      } catch (err) {
        console.error('Error loading intelligence:', err);
      } finally {
        setLoadingIntelligence({ ...loadingIntelligence, [newExpandedId]: false });
      }
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (status === 'completed') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    if (status === 'failed') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  if (loading) {
    return <div className="text-gray-600">Loading scrapes...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {scrapes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No scrape history found for this client.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {scrapes.map((scrape) => {
              const isExpanded = expandedId === scrape.id;
              const urlsCount = Array.isArray(scrape.urls_scraped) ? scrape.urls_scraped.length : 0;

              return (
                <div key={scrape.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(scrape.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(scrape.scrape_date), 'MMM d, yyyy h:mm a')}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {urlsCount} URL{urlsCount !== 1 ? 's' : ''} scraped
                          {scrape.intelligence_count !== undefined && scrape.intelligence_count > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1">
                              <Brain className="w-3 h-3" />
                              {scrape.intelligence_count} intelligence item{scrape.intelligence_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={getStatusBadge(scrape.status)}>
                        {scrape.status}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {urlsCount > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">URLs Scraped</h4>
                          <ul className="list-disc list-inside space-y-1">
                    {scrape.urls_scraped.map((item, idx) => {
                      const urlValue =
                        typeof item === 'string'
                          ? item
                          : item && typeof item === 'object' && item.url
                          ? item.url
                          : '';

                      // Fallback: show raw JSON if not a string or no url field
                      const displayText =
                        urlValue || (item ? JSON.stringify(item) : 'N/A');

                      return (
                        <li key={idx} className="text-sm text-gray-600 break-all">
                          {urlValue ? (
                            <a
                              href={urlValue}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {displayText}
                            </a>
                          ) : (
                            <span>{displayText}</span>
                          )}
                        </li>
                      );
                    })}
                          </ul>
                        </div>
                      )}

                      {/* AI Intelligence Section */}
                      {scrape.intelligence_count > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            AI Intelligence ({scrape.intelligence_count} item{scrape.intelligence_count !== 1 ? 's' : ''})
                          </h4>
                          {loadingIntelligence[scrape.id] ? (
                            <div className="text-sm text-gray-500">Loading intelligence...</div>
                          ) : intelligenceByScrape[scrape.id] ? (
                            <div className="space-y-3">
                              {intelligenceByScrape[scrape.id].length === 0 ? (
                                <p className="text-sm text-gray-500">No intelligence found for this scrape.</p>
                              ) : (
                                intelligenceByScrape[scrape.id].map((item) => (
                                  <div key={item.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <span className="text-sm font-medium text-gray-900 capitalize">
                                          {item.intelligence_type}
                                        </span>
                                        {item.version && (
                                          <span className="text-xs text-gray-500 ml-2">v{item.version}</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                                      </span>
                                    </div>
                                    {item.content && (
                                      <p className="text-sm text-gray-700 line-clamp-2">
                                        {item.content.substring(0, 150)}
                                        {item.content.length > 150 ? '...' : ''}
                                      </p>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Data</h4>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 mb-2">
                            View JSON
                          </summary>
                          <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-xs">
                            {JSON.stringify(scrape.data_extracted, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

