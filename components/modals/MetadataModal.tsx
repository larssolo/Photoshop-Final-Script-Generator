
import React, { useState, useEffect } from 'react';
import { ActionType, MetadataAction } from '../../types';
import { MetadataIcon } from '../icons/Icons';

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: MetadataAction) => void;
  existingAction?: MetadataAction;
}

interface FieldState {
  enabled: boolean;
  value: string;
}

const MetadataModal: React.FC<MetadataModalProps> = ({ isOpen, onClose, onSave, existingAction }) => {
  const cfg = existingAction?.config;

  const [title, setTitle] = useState<FieldState>({ enabled: !!cfg?.title, value: cfg?.title || '' });
  const [author, setAuthor] = useState<FieldState>({ enabled: !!cfg?.author, value: cfg?.author || '' });
  const [copyright, setCopyright] = useState<FieldState>({ enabled: !!cfg?.copyright, value: cfg?.copyright || '' });
  const [description, setDescription] = useState<FieldState>({ enabled: !!cfg?.description, value: cfg?.description || '' });
  const [keywords, setKeywords] = useState<FieldState>({ enabled: !!cfg?.keywords, value: cfg?.keywords || '' });

  const [stripNumericPrefix, setStripNumericPrefix] = useState(cfg?.stripNumericPrefix ?? false);
  const [numericPrefixLength, setNumericPrefixLength] = useState(cfg?.numericPrefixLength ?? 6);
  const [addPrefix, setAddPrefix] = useState(cfg?.addPrefix || '');
  const [addSuffix, setAddSuffix] = useState(cfg?.addSuffix || '');

  useEffect(() => {
    if (!isOpen) return;
    const c = existingAction?.config;
    setTitle({ enabled: !!c?.title, value: c?.title || '' });
    setAuthor({ enabled: !!c?.author, value: c?.author || '' });
    setCopyright({ enabled: !!c?.copyright, value: c?.copyright || '' });
    setDescription({ enabled: !!c?.description, value: c?.description || '' });
    setKeywords({ enabled: !!c?.keywords, value: c?.keywords || '' });
    setStripNumericPrefix(c?.stripNumericPrefix ?? false);
    setNumericPrefixLength(c?.numericPrefixLength ?? 6);
    setAddPrefix(c?.addPrefix || '');
    setAddSuffix(c?.addSuffix || '');
  }, [existingAction, isOpen]);

  const handleSave = () => {
    const action: MetadataAction = {
      id: existingAction?.id || '',
      type: ActionType.METADATA,
      config: {
        ...(title.enabled && title.value ? { title: title.value } : {}),
        ...(author.enabled && author.value ? { author: author.value } : {}),
        ...(copyright.enabled && copyright.value ? { copyright: copyright.value } : {}),
        ...(description.enabled && description.value ? { description: description.value } : {}),
        ...(keywords.enabled && keywords.value ? { keywords: keywords.value } : {}),
        stripNumericPrefix,
        numericPrefixLength,
        ...(addPrefix ? { addPrefix } : {}),
        ...(addSuffix ? { addSuffix } : {}),
      },
    };
    onSave(action);
    onClose();
  };

  if (!isOpen) return null;

  const filenamePreview = (() => {
    let name = `${'0'.repeat(numericPrefixLength)} - Produkt_foto`;
    if (stripNumericPrefix) name = name.replace(new RegExp(`^\\d{${numericPrefixLength}}\\s*-\\s*`), '');
    if (addPrefix) name = addPrefix + name;
    if (addSuffix) name = name + addSuffix;
    return name + '.jpg';
  })();

  const hasRenameChange = stripNumericPrefix || !!addPrefix || !!addSuffix;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-brand-gray-700 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-5 p-6 border-b border-brand-gray-700 shrink-0">
          <div className="flex-shrink-0 w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20">
            <MetadataIcon className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{existingAction ? 'Edit' : 'Add'} Metadata Step</h2>
            <p className="text-sm text-brand-gray-400 mt-1">Update image metadata and rename the file.</p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-grow">

          {/* ── Metadata section ── */}
          <div className="p-6 border-b border-brand-gray-700">
            <h3 className="text-sm font-semibold text-brand-gray-300 uppercase tracking-wider mb-4">Metadata Fields</h3>
            <p className="text-xs text-brand-gray-500 mb-4">Enable a field to overwrite that value in every processed file. Leave disabled to keep the original value.</p>
            <div className="space-y-3">
              {([
                { label: 'Title', state: title, set: setTitle, placeholder: 'e.g. Product photo 2025' },
                { label: 'Author / Creator', state: author, set: setAuthor, placeholder: 'e.g. Jane Doe' },
                { label: 'Copyright', state: copyright, set: setCopyright, placeholder: 'e.g. © 2025 Acme Corp' },
                { label: 'Description / Caption', state: description, set: setDescription, placeholder: 'e.g. Studio product shot on white background' },
                { label: 'Keywords', state: keywords, set: setKeywords, placeholder: 'e.g. product, studio, white background' },
              ] as const).map(({ label, state, set, placeholder }) => (
                <div key={label} className={`rounded-xl border transition-all ${state.enabled ? 'border-violet-500/50 bg-violet-500/5' : 'border-brand-gray-700 bg-brand-gray-900'}`}>
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
                    <div
                      onClick={() => set(s => ({ ...s, enabled: !s.enabled }))}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${state.enabled ? 'bg-violet-500 border-violet-500' : 'border-brand-gray-600'}`}
                    >
                      {state.enabled && (
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${state.enabled ? 'text-white' : 'text-brand-gray-400'}`}>{label}</span>
                  </label>
                  {state.enabled && (
                    <div className="px-4 pb-3">
                      <input
                        type="text"
                        value={state.value}
                        onChange={e => set(s => ({ ...s, value: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-brand-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Rename section ── */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-brand-gray-300 uppercase tracking-wider mb-4">Rename File</h3>
            <div className="space-y-4">

              {/* Strip numeric prefix */}
              <div className={`rounded-xl border transition-all ${stripNumericPrefix ? 'border-violet-500/50 bg-violet-500/5' : 'border-brand-gray-700 bg-brand-gray-900'}`}>
                <label className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
                  <div
                    onClick={() => setStripNumericPrefix(v => !v)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${stripNumericPrefix ? 'bg-violet-500 border-violet-500' : 'border-brand-gray-600'}`}
                  >
                    {stripNumericPrefix && (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-medium block ${stripNumericPrefix ? 'text-white' : 'text-brand-gray-400'}`}>Strip numeric prefix</span>
                    <span className="text-xs text-brand-gray-500">Removes leading digits and dash, e.g. "123456 - " from filename</span>
                  </div>
                </label>
                {stripNumericPrefix && (
                  <div className="px-4 pb-3 flex items-center gap-3">
                    <label className="text-sm text-brand-gray-400 whitespace-nowrap">Number of digits:</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={numericPrefixLength}
                      onChange={e => setNumericPrefixLength(Math.max(1, Math.min(20, parseInt(e.target.value) || 6)))}
                      className="w-20 bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Add prefix */}
              <div className={`rounded-xl border transition-all ${addPrefix ? 'border-violet-500/50 bg-violet-500/5' : 'border-brand-gray-700 bg-brand-gray-900'}`}>
                <div className="px-4 py-3">
                  <label className="text-sm font-medium text-brand-gray-400 block mb-2">Add prefix to filename</label>
                  <input
                    type="text"
                    value={addPrefix}
                    onChange={e => setAddPrefix(e.target.value)}
                    placeholder='e.g. "2025_" → 2025_Produkt_foto.jpg'
                    className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-brand-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Add suffix */}
              <div className={`rounded-xl border transition-all ${addSuffix ? 'border-violet-500/50 bg-violet-500/5' : 'border-brand-gray-700 bg-brand-gray-900'}`}>
                <div className="px-4 py-3">
                  <label className="text-sm font-medium text-brand-gray-400 block mb-2">Add suffix to filename <span className="text-brand-gray-500 font-normal">(before extension)</span></label>
                  <input
                    type="text"
                    value={addSuffix}
                    onChange={e => setAddSuffix(e.target.value)}
                    placeholder='e.g. "_retouched" → Produkt_foto_retouched.jpg'
                    className="w-full bg-brand-gray-800 border border-brand-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-brand-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* Live preview */}
              {hasRenameChange && (
                <div className="rounded-xl border border-brand-gray-700 bg-brand-gray-900 px-4 py-3">
                  <p className="text-xs text-brand-gray-500 mb-1">Preview</p>
                  <p className="text-xs text-brand-gray-400 font-mono">
                    <span className="text-brand-gray-600">{`${'0'.repeat(numericPrefixLength)} - Produkt_foto.jpg`}</span>
                    <span className="mx-2 text-brand-gray-600">→</span>
                    <span className="text-green-400">{filenamePreview}</span>
                  </p>
                </div>
              )}

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
            className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-600/20 transition-all transform active:scale-95 text-sm"
          >
            {existingAction ? 'Save Changes' : 'Add Metadata Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetadataModal;
