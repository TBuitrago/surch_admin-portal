import { useState } from 'react';
import { X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, clientName }) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText === 'DELETE') {
      onConfirm();
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Delete Client</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">
              This action will permanently delete <strong>{clientName}</strong> and remove all visibility of this client from the portal.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Related records (scrapes, intelligence, emails) will be handled according to your database foreign key settings.
            </p>
            <p className="text-sm font-medium text-gray-900 mb-2">
              Type <span className="text-red-600 font-mono">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Type DELETE to confirm"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmText !== 'DELETE'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Delete Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

