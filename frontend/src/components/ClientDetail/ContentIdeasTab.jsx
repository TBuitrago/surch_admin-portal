import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Lightbulb, TrendingUp, ExternalLink, FileText, Play } from 'lucide-react';

export default function ContentIdeasTab({ clientId }) {
  const [contentIdeas, setContentIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [expandedIdeaIndex, setExpandedIdeaIndex] = useState({});

  useEffect(() => {
    loadContentIdeas();
  }, [clientId]);

  const loadContentIdeas = async () => {
    try {
      setLoading(true);
      const data = await api.getClientContentIdeas(clientId);
      setContentIdeas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getDomainFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const renderResearchSection = (idea) => {
    // Parse research_context - primary source is research_context.trending_topics
    let researchContext = {};
    try {
      if (idea.research_context) {
        researchContext = typeof idea.research_context === 'string' 
          ? JSON.parse(idea.research_context) 
          : idea.research_context;
      }
    } catch (e) {
      // If parsing fails, try as-is
      researchContext = idea.research_context || {};
    }

    // Fallback to other possible structures if research_context doesn't exist
    if (!researchContext || Object.keys(researchContext).length === 0) {
      try {
        if (idea.research) {
          researchContext = typeof idea.research === 'string' ? JSON.parse(idea.research) : idea.research;
        } else if (idea.metadata?.research) {
          researchContext = typeof idea.metadata.research === 'string' 
            ? JSON.parse(idea.metadata.research) 
            : idea.metadata.research;
        }
      } catch (e) {
        researchContext = idea.research || idea.metadata?.research || {};
      }
    }

    // Get trending topics - PRIMARY: research_context.trending_topics
    const trendingTopics = researchContext.trending_topics || researchContext.trending_keywords || [];
    const sourceLinks = researchContext.source_links || researchContext.sources || [];

    // If no trending topics, return null (don't show section)
    if (!trendingTopics || trendingTopics.length === 0) {
      return null;
    }

    return (
      <div className="space-y-6">
        {trendingTopics.length > 0 && (
          <div>
            {trendingTopics.map((topic, idx) => {
              const topicData = typeof topic === 'string' 
                ? { title: topic, summary: null } 
                : topic;

              return (
                <div key={idx} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">
                    {topicData.title || topicData.name || topic}
                  </h5>
                  {topicData.summary && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {topicData.summary}
                    </p>
                  )}
                  {topicData.relevance && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {topicData.relevance}
                    </p>
                  )}
                  {/* Source links for this topic */}
                  {topicData.source_links && Array.isArray(topicData.source_links) && topicData.source_links.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {topicData.source_links.map((link, linkIdx) => {
                        const url = typeof link === 'string' ? link : link.url || link;
                        const label = typeof link === 'string' ? getDomainFromUrl(url) : (link.label || link.title || getDomainFromUrl(url));
                        return (
                          <a
                            key={linkIdx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 group"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="group-hover:underline">{label}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {sourceLinks.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Sources</h5>
            <div className="space-y-2">
              {sourceLinks.map((link, idx) => {
                const url = typeof link === 'string' ? link : link.url || link;
                const title = typeof link === 'string' ? getDomainFromUrl(url) : (link.title || getDomainFromUrl(url));
                
                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 group"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="group-hover:underline">{title}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const toggleIdeaExpand = (ideaId, ideaIndex) => {
    setExpandedIdeaIndex(prev => {
      const newState = { ...prev };
      if (newState[ideaId] === ideaIndex) {
        // Collapse if already expanded
        delete newState[ideaId];
      } else {
        // Expand this one (only one per ideation run)
        newState[ideaId] = ideaIndex;
      }
      return newState;
    });
  };

  const renderVideoScript = (ideaData) => {
    return (
      <div className="mt-4 pt-4 border-t-2 border-purple-300 bg-white rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-5 h-5 text-purple-600" />
          <h4 className="text-base font-bold text-gray-900">Video Script</h4>
        </div>
        
        <div className="space-y-4">
          {/* Script Title */}
          {(ideaData.headline || ideaData.title) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Script Title</p>
              <p className="text-lg font-bold text-gray-900">
                {ideaData.headline || ideaData.title}
              </p>
            </div>
          )}

          {/* Opening Hook */}
          {ideaData.hook && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Opening Hook</p>
              <p className="text-base text-gray-800 leading-relaxed italic pl-4 border-l-4 border-purple-400">
                {ideaData.hook}
              </p>
            </div>
          )}

          {/* Main Talking Points / Narrative */}
          {(ideaData.angle || ideaData.key_message) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Main Talking Points</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {ideaData.angle || ideaData.key_message}
                </p>
              </div>
            </div>
          )}

          {/* Suggested Format */}
          {ideaData.format && (
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Suggested Format:</span>
                <span className="text-sm font-medium text-gray-700">{ideaData.format}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContentIdeasSection = (idea) => {
    // Parse content ideas - handle multiple possible structures
    let ideas = [];
    try {
      if (idea.content_ideas) {
        ideas = Array.isArray(idea.content_ideas) 
          ? idea.content_ideas 
          : JSON.parse(idea.content_ideas);
      } else if (idea.ideas) {
        ideas = Array.isArray(idea.ideas) ? idea.ideas : JSON.parse(idea.ideas);
      } else if (idea.metadata?.content_ideas) {
        ideas = Array.isArray(idea.metadata.content_ideas) 
          ? idea.metadata.content_ideas 
          : JSON.parse(idea.metadata.content_ideas);
      } else if (idea.metadata?.ideas) {
        ideas = Array.isArray(idea.metadata.ideas) 
          ? idea.metadata.ideas 
          : JSON.parse(idea.metadata.ideas);
      }
    } catch (e) {
      ideas = idea.content_ideas || idea.ideas || idea.metadata?.content_ideas || idea.metadata?.ideas || [];
    }

    if (!ideas || ideas.length === 0) {
      return null;
    }

    const expandedIndex = expandedIdeaIndex[idea.id];

    return (
      <div className="space-y-4">
        <div className="grid gap-4">
          {ideas.map((item, idx) => {
            const ideaData = typeof item === 'string' 
              ? { headline: item, hook: null, angle: null, format: null } 
              : item;
            
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => toggleIdeaExpand(idea.id, idx)}
              >
                {/* Collapsed State - Clean and Scannable */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Headline */}
                      {(ideaData.headline || ideaData.title) && (
                        <h6 className="text-base font-bold text-gray-900 mb-2">
                          {ideaData.headline || ideaData.title}
                        </h6>
                      )}
                      
                      {/* Preview of hook */}
                      {ideaData.hook && !isExpanded && (
                        <p className="text-sm text-gray-600 italic line-clamp-2">
                          "{ideaData.hook}"
                        </p>
                      )}

                      {/* Format badge */}
                      {ideaData.format && (
                        <div className="flex items-center gap-2 mt-3">
                          <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-xs font-medium text-purple-700">
                            {ideaData.format}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded State - Full Video Script */}
                {isExpanded && renderVideoScript(ideaData)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-gray-600">Loading content ideas...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  const getStatusBadge = (status) => {
    if (!status) return null;
    const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    if (status === 'completed' || status === 'ready') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    if (status === 'pending' || status === 'processing') {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    return `${baseClasses} bg-gray-100 text-gray-800`;
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {contentIdeas.length === 0 ? (
          <div className="p-12 text-center">
            <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No content ideas available</p>
            <p className="text-sm text-gray-400 mt-2">Content ideation runs will appear here once generated.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contentIdeas.map((idea) => {
              const isExpanded = expandedId === idea.id;
              const status = idea.status || 'ready';

              return (
                <div key={idea.id} className="p-5 hover:bg-gray-50 transition-colors">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleExpand(idea.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-base font-semibold text-gray-900">
                          {format(new Date(idea.created_at), 'MMM d, yyyy')}
                        </div>
                        {idea.version && (
                          <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                            Version {idea.version}
                          </span>
                        )}
                        {getStatusBadge(status) && (
                          <span className={getStatusBadge(status)}>
                            {status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {idea.scrape && (
                          <div>
                            Based on website data from {format(new Date(idea.scrape.scrape_date), 'MMM d, yyyy')}
                          </div>
                        )}
                        {idea.intelligence && (
                          <div>
                            Using {idea.intelligence.intelligence_type} profile
                            {idea.intelligence.version && ` (v${idea.intelligence.version})`}
                          </div>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      {/* Research & Trends Section - Secondary */}
                      <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-gray-600" />
                          <h3 className="text-base font-semibold text-gray-900">Research & Trends</h3>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                          {renderResearchSection(idea) || (
                            <p className="text-sm text-gray-500 italic">No research data available for this ideation run.</p>
                          )}
                        </div>
                      </div>

                      {/* Content Ideas Section - Primary/Dominant */}
                      <div>
                        <div className="flex items-center gap-2 mb-5">
                          <Lightbulb className="w-5 h-5 text-purple-600" />
                          <h3 className="text-lg font-bold text-gray-900">Content Ideas</h3>
                        </div>
                        {renderContentIdeasSection(idea) || (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                            <Lightbulb className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No content ideas available for this run.</p>
                          </div>
                        )}
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

