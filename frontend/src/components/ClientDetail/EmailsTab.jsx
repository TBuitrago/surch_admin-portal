import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Mail, FileText, Info } from 'lucide-react';

export default function EmailsTab({ clientId }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadEmails();
  }, [clientId]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await api.getClientEmails(clientId);
      setEmails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    if (status === 'sent') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    if (status === 'failed') {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const parseRecipients = (recipient) => {
    // Handle both string and array formats
    if (Array.isArray(recipient)) {
      return recipient.filter(r => r && r.trim() !== '');
    }
    if (typeof recipient === 'string') {
      // Try to parse as JSON array first
      try {
        const parsed = JSON.parse(recipient);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => r && r.trim() !== '');
        }
      } catch {
        // Not JSON, treat as comma-separated string
        return recipient.split(',').map(r => r.trim()).filter(r => r !== '');
      }
    }
    return [];
  };

  const getRecipientCount = (recipient) => {
    const recipients = parseRecipients(recipient);
    return recipients.length;
  };

  if (loading) {
    return <div className="text-gray-600">Loading emails...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {emails.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No email logs found</p>
            <p className="text-sm text-gray-400 mt-2">Email delivery logs will appear here once emails are sent.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {emails.map((email) => {
              const isExpanded = expandedId === email.id;
              const recipients = parseRecipients(email.recipient);
              const recipientCount = recipients.length;

              return (
                <div key={email.id} className="p-5 hover:bg-gray-50 transition-colors">
                  {/* Summary Row */}
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => toggleExpand(email.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-base font-semibold text-gray-900">
                          {format(new Date(email.sent_at), 'MMM d, yyyy h:mm a')}
                        </div>
                        <span className={getStatusBadge(email.status)}>
                          {email.status}
                        </span>
                        {email.email_type && (
                          <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-medium capitalize">
                            {email.email_type}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-900 font-medium mb-1 line-clamp-1">
                        {email.subject}
                      </div>
                      <div className="text-xs text-gray-500">
                        {recipientCount > 0 
                          ? `Sent to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`
                          : 'No recipients'}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Expanded Detail View */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                      {/* Recipients Section */}
                      {recipients.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-5 h-5 text-gray-600" />
                            <h3 className="text-base font-semibold text-gray-900">Recipients</h3>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-2">
                              {recipients.map((recipient, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span>{recipient}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Email Content Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-gray-600" />
                          <h3 className="text-base font-semibold text-gray-900">Email Content</h3>
                        </div>
                        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                          <div className="p-4 max-h-96 overflow-y-auto">
                            {email.body ? (
                              <div 
                                className="email-body-content"
                                dangerouslySetInnerHTML={{ __html: email.body }}
                                style={{
                                  fontFamily: 'system-ui, -apple-system, sans-serif',
                                  fontSize: '14px',
                                  lineHeight: '1.6',
                                  color: '#374151'
                                }}
                              />
                            ) : (
                              <p className="text-sm text-gray-500 italic">No email body content available.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Metadata Section */}
                      {(email.email_type || email.metadata) && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-gray-600" />
                            <h3 className="text-base font-semibold text-gray-900">Metadata</h3>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="space-y-3">
                              {email.email_type && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Email Type
                                  </p>
                                  <p className="text-sm text-gray-900 capitalize">{email.email_type}</p>
                                </div>
                              )}
                              {email.metadata?.frequency && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Frequency
                                  </p>
                                  <p className="text-sm text-gray-900 capitalize">{email.metadata.frequency}</p>
                                </div>
                              )}
                              {email.metadata?.content_ideas_id && (
                                <div>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                    Content Ideas ID
                                  </p>
                                  <p className="text-sm text-gray-600 font-mono">
                                    {email.metadata.content_ideas_id}
                                  </p>
                                </div>
                              )}
                              {email.metadata && Object.keys(email.metadata).length > 0 && (
                                <details className="mt-4">
                                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 mb-2">
                                    View Full Metadata
                                  </summary>
                                  <pre className="bg-white p-3 rounded-md overflow-auto text-xs border border-gray-200">
                                    {JSON.stringify(email.metadata, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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

