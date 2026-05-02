
import React, { useState, useEffect } from 'react';
import { ActionType, FlattenAction } from '../../types';
import { FlattenIcon } from '../icons/Icons';

interface FlattenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: FlattenAction) => void;
  existingAction?: FlattenAction;
}

const FlattenModal: React.FC<FlattenModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const [preserveTransparency, setPreserveTransparency] = useState(existingAction?.config.preserveTransparency ?? false);

  useEffect(() => {
    if (isOpen) {
      setPreserveTransparency(existingAction?.config.preserveTransparency ?? false);
    }
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const action: FlattenAction = {
      id: existingAction?.id || '',
      type: ActionType.FLATTEN,
      config: { preserveTransparency },
    };
    onSave(action);
    onClose();
  };

  if (!isOpen) return null;

  const options = [
    {
      value: false,
      label: 'Flatten Image',
      desc: 'Merges all layers. Transparent areas are filled with the background color (usually white). Use before saving to JPEG or other formats that do not support transparency.',
    },
    {
      value: true,
      label: 'Merge Visible Layers (preserve transparency)',
      desc: 'Merges all visible layers while keeping transparent areas transparent. Use before saving to PNG or other formats that support transparency.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-brand-gray-700 flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
          <div className="flex-shrink-0 w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-sm">
            <FlattenIcon className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Flatten Step</h2>
            <p className="text-sm text-brand-gray-400 mt-1">Choose how to merge layers.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {options.map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => setPreserveTransparency(opt.value)}
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${preserveTransparency === opt.value ? 'bg-cyan-600/20 border-cyan-500 ring-1 ring-cyan-500' : 'bg-brand-gray-900 border-brand-gray-700 hover:bg-brand-gray-800 hover:border-brand-gray-600'}`}
            >
              <div className="flex-grow">
                <span className={`font-semibold block ${preserveTransparency === opt.value ? 'text-white' : 'text-brand-gray-200'}`}>{opt.label}</span>
                <span className="text-xs text-brand-gray-400 mt-1 block leading-relaxed">{opt.desc}</span>
              </div>
              {preserveTransparency === opt.value && (
                <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-black">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
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
            className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-lg shadow-cyan-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Flatten Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlattenModal;
