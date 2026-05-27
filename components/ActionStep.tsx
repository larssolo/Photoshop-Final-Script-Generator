
import React, { useState } from 'react';
import { Action, ActionType, ResizeAction, SaveAction, CreateFolderAction, RotateAction, ColorModeAction, ResizeMode, RotationType, ConditionAction, ConditionProperty, ConditionOperator, SaveLogic, FileNameConflictResolution, TrimAction, TrimBasedOn, FlattenAction, MetadataAction } from '../types';
import { EditIcon, TrashIcon, ResizeIcon, SaveIcon, FolderIcon, DragHandleIcon, RotateIcon, ColorSwatchIcon, BranchIcon, ChevronDownIcon, ScissorsIcon, FlattenIcon, MetadataIcon } from './icons/Icons';

interface ActionStepProps {
  action: Action;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropZoneOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropZoneDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  dropIndicator: 'before' | 'after' | 'inside' | null;
  level: number;
  children?: React.ReactNode;
}

const getConditionText = (condition: ConditionAction['config']['condition']): string => {
    const propMap: Record<ConditionProperty, string> = {
        [ConditionProperty.WIDTH]: 'Width',
        [ConditionProperty.HEIGHT]: 'Height',
        [ConditionProperty.FILENAME]: 'Filename',
        [ConditionProperty.FILETYPE]: 'File Type',
        [ConditionProperty.COLOR_MODE]: 'Color Mode',
    };
    const opMap: Record<ConditionOperator, string> = {
        [ConditionOperator.GREATER_THAN]: '>',
        [ConditionOperator.LESS_THAN]: '<',
        [ConditionOperator.CONTAINS]: 'contains',
        [ConditionOperator.DOES_NOT_CONTAIN]: 'does not contain',
        [ConditionOperator.IS]: 'is',
        [ConditionOperator.IS_NOT]: 'is not',
    };
    const value = (propMap[condition.property] === 'Width' || propMap[condition.property] === 'Height')
        ? `${condition.value}px`
        : `"${condition.value}"`;
    return `If ${propMap[condition.property]} ${opMap[condition.operator]} ${value}`;
};

type ActionMeta = { title: string; description: string; icon: React.ReactNode; accentClass: string; iconBg: string; };

const getActionDetails = (action: Action): ActionMeta => {
  switch (action.type) {
    case ActionType.RESIZE: {
      const config = (action as ResizeAction).config;
      let parts: string[] = [];
      if (config.mode === ResizeMode.LONGEST_EDGE && config.length) {
        parts.push(`Longest edge: ${config.length}${config.unit}`);
      } else {
        if (config.width) parts.push(`W: ${config.width}${config.unit}`);
        if (config.height) parts.push(`H: ${config.height}${config.unit}`);
      }
      if (config.resolution) parts.push(`${config.resolution} DPI`);
      const hasSave = !!config.saveConfig || (config.saveLogic === SaveLogic.CONDITIONAL && (!!config.conditionalSaveConfig?.onRGB || !!config.conditionalSaveConfig?.onCMYK));
      const title = hasSave ? 'Resize & Save' : 'Resize Image';
      let description = parts.length > 0 ? parts.join(' · ') : 'Configure resize details';
      if (config.saveLogic === SaveLogic.CONDITIONAL) {
        description += ' · Save: Conditional';
      } else if (config.saveConfig) {
        description += ` · Save: ${config.saveConfig.format}`;
      }
      return { title, description, icon: <ResizeIcon className="w-4 h-4" />, accentClass: 'border-l-blue-500', iconBg: 'bg-blue-500/15 text-blue-400' };
    }
    case ActionType.SAVE: {
      const config = (action as SaveAction).config;
      let description = `${config.format}`;
      if (config.format === 'JPEG' && config.jpegQuality) description += ` Q${config.jpegQuality}`;
      if (config.appendSuffix) description += ` · "${config.appendSuffix}"`;
      if (config.subfolder) description += ` → ${config.subfolder}/`;
      return { title: 'Save Image', description, icon: <SaveIcon className="w-4 h-4" />, accentClass: 'border-l-emerald-500', iconBg: 'bg-emerald-500/15 text-emerald-400' };
    }
    case ActionType.CREATE_FOLDER: {
      const config = (action as CreateFolderAction).config;
      return { title: 'Create Folder', description: `"${config.folderName}"`, icon: <FolderIcon className="w-4 h-4" />, accentClass: 'border-l-purple-500', iconBg: 'bg-purple-500/15 text-purple-400' };
    }
    case ActionType.ROTATE: {
      const config = (action as RotateAction).config;
      const rotMap: Record<RotationType, string> = {
        [RotationType.CW_90]: '90° Clockwise',
        [RotationType.CCW_90]: '90° Counter-Clockwise',
        [RotationType.DEG_180]: '180°',
      };
      return { title: 'Rotate Image', description: rotMap[config.rotation] ?? config.rotation, icon: <RotateIcon className="w-4 h-4" />, accentClass: 'border-l-yellow-500', iconBg: 'bg-yellow-500/15 text-yellow-400' };
    }
    case ActionType.COLOR_MODE: {
      const config = (action as ColorModeAction).config;
      return { title: 'Convert Color Mode', description: config.profile, icon: <ColorSwatchIcon className="w-4 h-4" />, accentClass: 'border-l-pink-500', iconBg: 'bg-pink-500/15 text-pink-400' };
    }
    case ActionType.TRIM: {
      const config = (action as TrimAction).config;
      const basedOnMap: Record<TrimBasedOn, string> = {
        [TrimBasedOn.TRANSPARENT_PIXELS]: 'Transparency',
        [TrimBasedOn.TOP_LEFT_PIXEL_COLOR]: 'Top-Left Color',
        [TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR]: 'Bottom-Right Color',
      };
      const sides = [config.top && 'T', config.bottom && 'B', config.left && 'L', config.right && 'R'].filter(Boolean).join('');
      return { title: 'Trim Image', description: `${basedOnMap[config.basedOn]}${sides ? ` (${sides})` : ''}`, icon: <ScissorsIcon className="w-4 h-4" />, accentClass: 'border-l-orange-500', iconBg: 'bg-orange-500/15 text-orange-400' };
    }
    case ActionType.CONDITION: {
      const config = (action as ConditionAction).config;
      return { title: 'Condition', description: getConditionText(config.condition), icon: <BranchIcon className="w-4 h-4" />, accentClass: 'border-l-teal-500', iconBg: 'bg-teal-500/15 text-teal-400' };
    }
    case ActionType.FLATTEN: {
      const preserveTransparency = (action as FlattenAction).config.preserveTransparency;
      return { title: 'Flatten Image', description: preserveTransparency ? 'Merge Visible (keep transparency)' : 'Full flatten', icon: <FlattenIcon className="w-4 h-4" />, accentClass: 'border-l-cyan-500', iconBg: 'bg-cyan-500/15 text-cyan-400' };
    }
    case ActionType.METADATA: {
      const cfg = (action as MetadataAction).config;
      const metaParts = [cfg.title && 'Title', cfg.author && 'Author', cfg.copyright && 'Copyright', cfg.description && 'Desc', cfg.keywords && 'Keywords'].filter(Boolean);
      const renameParts = [cfg.stripNumericPrefix && `Strip ${cfg.numericPrefixLength}-digit`, cfg.addPrefix && `+Prefix`, cfg.addSuffix && `+Suffix`].filter(Boolean);
      const parts = [metaParts.length > 0 && `Meta: ${metaParts.join(', ')}`, renameParts.length > 0 && `Rename: ${renameParts.join(', ')}`].filter(Boolean);
      return { title: 'Metadata & Rename', description: parts.length > 0 ? parts.join(' · ') : 'No changes configured', icon: <MetadataIcon className="w-4 h-4" />, accentClass: 'border-l-violet-500', iconBg: 'bg-violet-500/15 text-violet-400' };
    }
    default:
      return { title: 'Unknown Action', description: 'Action not recognized', icon: null, accentClass: 'border-l-brand-gray-600', iconBg: 'bg-brand-gray-700 text-brand-gray-400' };
  }
};

const ActionStep: React.FC<ActionStepProps> = ({
  action, onEdit, onDelete, onDragStart, onDragOver, onDrop,
  onDropZoneOver, onDropZoneDrop, onDragEnd, dropIndicator, level, children
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { title, description, icon, accentClass, iconBg } = getActionDetails(action);
  const isContainer = action.type === ActionType.CONDITION || action.type === ActionType.CREATE_FOLDER || action.type === ActionType.TRIM;

  return (
    <div
      style={{ marginLeft: level > 0 ? `${level * 1.75}rem` : '0' }}
      className="relative"
    >
      {/* Drop indicator: BEFORE */}
      {dropIndicator === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full z-20 pointer-events-none shadow-sm shadow-brand-blue/50" />
      )}

      {level > 0 && (
        <>
          <div className="absolute top-5 -left-3.5 w-3.5 h-px bg-brand-gray-600/60" />
          <div className="absolute -top-2 -left-3.5 h-[calc(50%)] w-px bg-brand-gray-600/60" />
          <div className="absolute top-5 -left-3.5 h-[calc(100%-1.25rem)] w-px bg-brand-gray-600/60" />
        </>
      )}

      <div className="flex flex-col">
        <div
          className={`
            group relative bg-brand-gray-800/80 rounded-xl border border-brand-gray-700/50
            border-l-2 ${accentClass}
            ${dropIndicator === 'inside' ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue/20' : 'hover:border-brand-gray-600/80 hover:bg-brand-gray-800'}
            p-3 flex flex-col transition-all duration-150 select-none cursor-grab active:cursor-grabbing active:shadow-xl active:scale-[0.99]
          `}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={isContainer ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-grow min-w-0">
              <DragHandleIcon className="w-4 h-4 text-brand-gray-600 group-hover:text-brand-gray-500 flex-shrink-0 transition-colors" />
              <div className={`flex-shrink-0 w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
                {icon}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="font-semibold text-white text-sm leading-tight truncate">{title}</p>
                <p className="text-xs text-brand-gray-400 truncate mt-0.5">{description}</p>
              </div>
              {isContainer && (
                <ChevronDownIcon className={`w-4 h-4 text-brand-gray-500 flex-shrink-0 ml-1 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
              )}
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-1.5 rounded-lg hover:bg-brand-gray-700 text-brand-gray-500 hover:text-brand-gray-200 transition-all duration-100 active:scale-90"
                title="Edit"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-brand-gray-500 hover:text-red-400 transition-all duration-100 active:scale-90"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isContainer && (
          <div className={`transition-[grid-template-rows] duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="pt-1.5 flex flex-col gap-1.5">
                {children}
                <div
                  className={`text-xs text-center border border-dashed rounded-lg py-3 transition-all duration-150 ${
                    dropIndicator === 'inside'
                      ? 'border-brand-blue text-brand-blue bg-brand-blue/5'
                      : 'border-brand-gray-600/50 text-brand-gray-500 hover:border-brand-gray-500/70 hover:text-brand-gray-400'
                  }`}
                  style={{ marginLeft: `${(level + 1) * 1.75}rem` }}
                  onDragOver={onDropZoneOver}
                  onDrop={onDropZoneDrop}
                >
                  Drop steps here
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drop indicator: AFTER */}
      {dropIndicator === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full z-20 pointer-events-none shadow-sm shadow-brand-blue/50" />
      )}
    </div>
  );
};

export default ActionStep;
