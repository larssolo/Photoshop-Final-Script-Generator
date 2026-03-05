
import React, { useState, useEffect } from 'react';
import { ActionType, CreateFolderAction } from '../../types';
import { FolderIcon } from '../icons/Icons';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: CreateFolderAction) => void;
  existingAction?: CreateFolderAction;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [folderName, setFolderName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (existingAction) {
        setFolderName(existingAction.config.folderName || '');
      } else {
        setFolderName('');
      }
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      setError("Folder name cannot be empty.");
      return;
    }

    setError('');
    const action: CreateFolderAction = {
      id: existingAction?.id || '',
      type: ActionType.CREATE_FOLDER,
      config: {
        folderName: trimmedName,
      },
      then: existingAction?.then || [],
    };
    onSave(action);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        // Prevent triggering if focus is on a button (like Cancel)
        if (target.tagName === 'BUTTON') return;
        
        e.preventDefault();
        handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-brand-gray-700 flex flex-col"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-sm">
                <FolderIcon className="w-7 h-7 text-purple-400" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Folder Step</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Create a subfolder for organization.</p>
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

            <div className="space-y-4">
                <div>
                    <label htmlFor="folderName" className="block text-sm font-medium text-brand-gray-300 mb-1.5">Folder Name</label>
                    <input
                        id="folderName"
                        type="text"
                        placeholder="e.g., web-versions or \\server\share"
                        value={folderName}
                        onChange={e => { setFolderName(e.target.value); setError(''); }}
                        className="w-full bg-brand-gray-900 border border-brand-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        autoFocus
                    />
                    <p className="text-xs text-brand-gray-400 mt-2">
                        Supports standard subfolders or full UNC paths (e.g., <code className="bg-brand-gray-700 px-1 rounded text-brand-gray-300">\\server\share</code>).
                    </p>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-gray-700 flex justify-end gap-3 shrink-0 bg-brand-gray-800 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 rounded-lg font-medium text-brand-gray-400 hover:text-white hover:bg-brand-gray-700 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Folder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
