
import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './icons/Icons';

interface CodeBlockProps {
  script: string;
  isLoading: boolean;
  loadingMessage?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ script, isLoading, loadingMessage }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  useEffect(() => {
    setIsCopied(false);
  }, [script]);

  const placeholder = "Your generated script will appear here...\n\n// 1. Add steps in the builder panel\n// 2. Click 'Generate Script'\n// 3. Copy or download your .jsx file";

  return (
    <div className="relative bg-brand-gray-900 rounded-xl border border-brand-gray-700/60 flex flex-col" style={{ minHeight: '420px' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-brand-gray-700/60 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-gray-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-brand-gray-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-brand-gray-700"></div>
          <span className="ml-2 text-xs text-brand-gray-500 font-mono">photoshop-script.jsx</span>
        </div>
        <button
          onClick={handleCopy}
          disabled={!script || isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
            isCopied
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-brand-gray-700/80 hover:bg-brand-gray-700 text-brand-gray-300 hover:text-white border border-brand-gray-600/50 hover:border-brand-gray-500/80 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          {isCopied
            ? <><CheckIcon className="w-3.5 h-3.5" /> Copied!</>
            : <><ClipboardIcon className="w-3.5 h-3.5" /> Copy</>
          }
        </button>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-brand-gray-700"></div>
              <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-brand-blue animate-spin"></div>
            </div>
            {loadingMessage && (
              <p className="text-sm text-brand-gray-400 animate-pulse-subtle">{loadingMessage}</p>
            )}
          </div>
        ) : (
          <pre className="p-4 text-sm font-mono text-brand-gray-200 overflow-auto h-full leading-relaxed">
            <code>
              {script || <span className="text-brand-gray-600 whitespace-pre-wrap">{placeholder}</span>}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
