import React, { useState } from 'react';
import { FolderIcon } from '../icons/Icons';

interface SavePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  existingPresetNames: string[];
}

const SavePresetModal: React.FC<SavePresetModalProps> = ({ isOpen, onClose, onSave, existingPresetNames }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Preset name cannot be empty.');
      return;
    }
    if (existingPresetNames.includes(trimmedName)) {
      if (!window.confirm(`A preset named "${trimmedName}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }
    setError('');
    onSave(trimmedName);
    setName('');
    onClose();
  };

  const handleClose = () => {
    setError('');
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-brand-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-sm">
                <FolderIcon className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Save Preset</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Save your current workflow for later.</p>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg p-4 mb-6 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-500 mt-0.5 shrink-0">
                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="font-medium">{error}</div>
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="presetName" className="block text-sm font-medium text-brand-gray-300 mb-1.5">Preset Name</label>
                <input
                    id="presetName"
                    type="text"
                    placeholder="e.g., Web Export (JPEG)"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    autoFocus
                />
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-gray-700 flex justify-end gap-3 shrink-0 bg-brand-gray-800 rounded-b-xl">
          <button 
            onClick={handleClose} 
            className="px-5 py-2.5 rounded-lg font-medium text-brand-gray-400 hover:text-white hover:bg-brand-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all transform active:scale-95 text-sm"
          >
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePresetModal;