const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    // Include details if available
    const errorMessage = error.error || `HTTP error! status: ${response.status}`;
    const errorWithDetails = error.details ? `${errorMessage}: ${error.details}` : errorMessage;
    throw new Error(errorWithDetails);
  }

  return response.json();
}

export const api = {
  // Clients
  getClients: () => request('/api/clients'),
  getClient: (id) => request(`/api/clients/${id}`),
  createClient: (data) => request('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateClient: (id, data) => request(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteClient: (id) => request(`/api/clients/${id}`, {
    method: 'DELETE',
  }),
  triggerClientAutomation: (id) => request(`/api/clients/${id}/trigger-automation`, {
    method: 'POST',
  }),

  // Scrapes
  getClientScrapes: (clientId) => request(`/api/clients/${clientId}/scrapes`),
  getScrape: (id) => request(`/api/scrapes/${id}`),
  getScrapeIntelligence: (scrapeId) => request(`/api/scrapes/${scrapeId}/intelligence`),

  // Intelligence
  getClientIntelligence: (clientId) => request(`/api/clients/${clientId}/intelligence`),
  getClientIntelligenceByType: (clientId, type) => request(`/api/clients/${clientId}/intelligence/${type}`),

  // Content Ideas
  getClientContentIdeas: (clientId) => request(`/api/clients/${clientId}/content-ideas`),

  // Delivery Settings
  getDeliverySettings: (clientId) => request(`/api/clients/${clientId}/delivery-settings`),
  updateDeliverySettings: (clientId, data) => request(`/api/clients/${clientId}/delivery-settings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Emails
  getClientEmails: (clientId) => request(`/api/clients/${clientId}/emails`),
};

