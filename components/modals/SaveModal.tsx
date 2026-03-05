
import React, { useState, useEffect } from 'react';
import { ActionType, SaveAction, SaveFormat, FileNameConflictResolution } from '../../types';
import { SaveForm } from './ResizeModal';
import { SaveIcon } from '../icons/Icons';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: SaveAction) => void;
  existingAction?: SaveAction;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [config, setConfig] = useState<SaveAction['config']>({ format: SaveFormat.JPEG, jpegQuality: 8, conflictResolution: FileNameConflictResolution.OVERWRITE });

  useEffect(() => {
    if (isOpen) {
        if (existingAction) {
            // Ensure all keys are present to avoid uncontrolled component warnings
            setConfig({
                format: SaveFormat.JPEG,
                jpegQuality: 8,
                pngTransparency: true,
                tiffCompression: 'LZW',
                tiffTransparency: false,
                psdTiffLayers: false,
                appendSuffix: '',
                subfolder: '',
                conflictResolution: FileNameConflictResolution.OVERWRITE,
                ...existingAction.config,
            });
        } else {
            // Reset form for a new action
            setConfig({
                format: SaveFormat.JPEG,
                jpegQuality: 8,
                pngTransparency: true,
                tiffCompression: 'LZW',
                tiffTransparency: false,
                psdTiffLayers: false,
                appendSuffix: '',
                subfolder: '',
                conflictResolution: FileNameConflictResolution.OVERWRITE,
            });
        }
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const finalConfig = { ...config };
    if (finalConfig.subfolder) {
        finalConfig.subfolder = finalConfig.subfolder.trim();
    }
    if (!finalConfig.subfolder) {
        delete finalConfig.subfolder;
    }
    if (finalConfig.appendSuffix) {
        finalConfig.appendSuffix = finalConfig.appendSuffix.trim();
    }
    if (!finalConfig.appendSuffix) {
        delete finalConfig.appendSuffix;
    }


    const action: SaveAction = {
      id: existingAction?.id || '',
      type: ActionType.SAVE,
      config: finalConfig,
    };
    onSave(action);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON') return;
        
        e.preventDefault();
        handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-xl border border-brand-gray-700 flex flex-col max-h-[90vh]"
        onKeyDown={handleKeyDown}
      >
        
        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
            <div className="flex-shrink-0 w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shadow-sm">
                <SaveIcon className="w-7 h-7 text-green-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Save Step</h2>
                <p className="text-sm text-brand-gray-400 mt-1">Configure output format and location.</p>
            </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
            <SaveForm config={config} onUpdate={setConfig} idPrefix="save" accentColor="green" />
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
            className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Save Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
