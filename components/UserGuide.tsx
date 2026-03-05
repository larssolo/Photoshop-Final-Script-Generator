
import React from 'react';
import { PlusIcon, SparklesIcon, DownloadIcon, ClipboardIcon } from './icons/Icons';

const UserGuide: React.FC = () => {
  return (
    <div className="p-4 bg-brand-gray-900 rounded-lg border border-brand-gray-700 h-full flex flex-col justify-center">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-white mb-2">Welcome to the Script Generator!</h3>
        <p className="text-brand-gray-300">Follow these simple steps to automate your Photoshop workflow.</p>
      </div>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-gray-800 rounded-full flex items-center justify-center border border-brand-gray-700">
            <span className="text-brand-blue font-bold text-lg">1</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Build Your Actions</h4>
            <p className="text-sm text-brand-gray-400">Use the <PlusIcon className="inline w-4 h-4" /> buttons on the left to add steps like 'Resize', 'Save', or 'Create Folder' to build your script.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-gray-800 rounded-full flex items-center justify-center border border-brand-gray-700">
             <span className="text-brand-blue font-bold text-lg">2</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Generate the Script</h4>
            <p className="text-sm text-brand-gray-400">Once your steps are configured, click the <SparklesIcon className="inline w-4 h-4" /> 'Generate Script' button to let the AI write the code for you.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-gray-800 rounded-full flex items-center justify-center border border-brand-gray-700">
             <span className="text-brand-blue font-bold text-lg">3</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Copy or Download</h4>
            <p className="text-sm text-brand-gray-400">Your script will appear here. Use the <ClipboardIcon className="inline w-4 h-4" /> copy or <DownloadIcon className="inline w-4 h-4" /> download button to get the <code className="bg-brand-gray-700 text-xs px-1 rounded">.jsx</code> file.</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-brand-gray-800 rounded-full flex items-center justify-center border border-brand-gray-700">
             <span className="text-brand-blue font-bold text-lg">4</span>
          </div>
          <div>
            <h4 className="font-semibold text-white">Run in Photoshop</h4>
            <p className="text-sm text-brand-gray-400">In Photoshop, go to <code className="bg-brand-gray-700 text-xs px-1 rounded">File &gt; Scripts &gt; Browse...</code> and select your downloaded file to run the automation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
