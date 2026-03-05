
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
    // Reset copied state when script changes
    setIsCopied(false);
  }, [script]);

  const placeholderText = "Your generated script will be displayed here...\n\n1. Build your steps in the left panel.\n2. Click 'Generate Script'.\n3. The code will appear here, ready to be copied.";

  return (
    <div className="relative bg-brand-gray-900 rounded-lg border border-brand-gray-700 h-96">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-brand-gray-700 hover:bg-brand-gray-600 transition-colors text-brand-gray-300"
        disabled={!script || isLoading}
      >
        {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
      </button>
      <pre className="w-full h-full p-4 overflow-auto text-sm">
        <code className="language-javascript">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
                    {loadingMessage && <p className="mt-4 text-brand-gray-300">{loadingMessage}</p>}
                </div>
            ) : (
                script || <span className="text-brand-gray-500 whitespace-pre-wrap">{placeholderText}</span>
            )}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
