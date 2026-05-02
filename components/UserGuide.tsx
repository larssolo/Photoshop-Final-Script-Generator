
import React, { useState } from 'react';
import { PlusIcon, SparklesIcon, DownloadIcon, ClipboardIcon, ResizeIcon, SaveIcon, FolderIcon, RotateIcon, ColorSwatchIcon, BranchIcon, ScissorsIcon, FlattenIcon, MetadataIcon } from './icons/Icons';

const UserGuide: React.FC = () => {
  const [showActions, setShowActions] = useState(false);

  const actions = [
    {
      icon: <ResizeIcon className="w-4 h-4 text-blue-400" />,
      color: 'bg-blue-500/10 border-blue-500/20',
      name: 'Resize',
      desc: 'Skaler billedet til faste mål (bredde × højde), en procent, eller så den længste kant passer. Vælg DPI og om aspektforholdet skal bevares.',
    },
    {
      icon: <SaveIcon className="w-4 h-4 text-green-400" />,
      color: 'bg-green-500/10 border-green-500/20',
      name: 'Save',
      desc: 'Gem billedet som JPEG, PNG, TIFF eller PSD. Sæt kvalitet, transparens, komprimering og tilføj evt. suffiks eller undermappe til outputstien.',
    },
    {
      icon: <FolderIcon className="w-4 h-4 text-purple-400" />,
      color: 'bg-purple-500/10 border-purple-500/20',
      name: 'Folder',
      desc: 'Opret en undermappe i outputmappen. Handlinger placeret inde i mappen gemmer automatisk dertil — nyttigt til at opdele output i kategorier.',
    },
    {
      icon: <RotateIcon className="w-4 h-4 text-yellow-400" />,
      color: 'bg-yellow-500/10 border-yellow-500/20',
      name: 'Rotate',
      desc: 'Roter billedet 90° med uret, 90° mod uret eller 180°.',
    },
    {
      icon: <ScissorsIcon className="w-4 h-4 text-orange-400" />,
      color: 'bg-orange-500/10 border-orange-500/20',
      name: 'Trim',
      desc: 'Beskær automatisk kanter baseret på transparens eller baggrundsfarve. Vælg hvilke sider (top, bund, venstre, højre) der trimmes. Handlinger indeni opererer på det trimmede billede — originalens kanter gendannes bagefter.',
    },
    {
      icon: <ColorSwatchIcon className="w-4 h-4 text-pink-400" />,
      color: 'bg-pink-500/10 border-pink-500/20',
      name: 'Color Mode',
      desc: 'Konverter billedets farverum til RGB, CMYK eller Gråtone. Bruges typisk inden gem til et format med specifikke krav (fx CMYK til tryk).',
    },
    {
      icon: <BranchIcon className="w-4 h-4 text-teal-400" />,
      color: 'bg-teal-500/10 border-teal-500/20',
      name: 'Condition',
      desc: 'Tilføj betinget logik (if/then). Handlinger indeni udføres kun hvis betingelsen er opfyldt — fx "kun hvis bredde > 2000px" eller "kun hvis filnavn indeholder \'web\'".',
    },
    {
      icon: <FlattenIcon className="w-4 h-4 text-cyan-400" />,
      color: 'bg-cyan-500/10 border-cyan-500/20',
      name: 'Flatten',
      desc: 'Flet alle lag til ét. Vælg mellem fuld flatten (transparens fyldes med baggrundfarve) eller Merge Visible Layers (bevarer transparens).',
    },
    {
      icon: <MetadataIcon className="w-4 h-4 text-violet-400" />,
      color: 'bg-violet-500/10 border-violet-500/20',
      name: 'Metadata & Rename',
      desc: 'Opdater billedets metadata (titel, forfatter, copyright, beskrivelse, keywords) og omdøb outputfilen — fx fjern et numerisk præfiks ("123456 - "), tilføj præfiks eller suffiks.',
    },
  ];

  return (
    <div className="p-4 bg-brand-gray-900 rounded-lg border border-brand-gray-700 h-full flex flex-col">
      {/* How-to steps */}
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

      {/* Divider + toggle */}
      <div className="mt-8 border-t border-brand-gray-700 pt-6">
        <button
          onClick={() => setShowActions(v => !v)}
          className="w-full flex items-center justify-between text-left group"
        >
          <span className="text-sm font-semibold text-brand-gray-300 group-hover:text-white transition-colors">Overblik over handlinger</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4 h-4 text-brand-gray-400 transition-transform duration-200 ${showActions ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {showActions && (
          <div className="mt-4 space-y-2">
            {actions.map(a => (
              <div key={a.name} className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${a.color}`}>
                <div className="flex-shrink-0 mt-0.5 w-6 h-6 flex items-center justify-center">
                  {a.icon}
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{a.name}</span>
                  <p className="text-xs text-brand-gray-400 mt-0.5 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserGuide;
