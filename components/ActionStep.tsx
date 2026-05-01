
import React, { useState } from 'react';
import { Action, ActionType, ResizeAction, SaveAction, CreateFolderAction, RotateAction, ColorModeAction, ResizeMode, RotationType, ConditionAction, ConditionProperty, ConditionOperator, SaveLogic, FileNameConflictResolution, TrimAction, TrimBasedOn } from '../types';
import { EditIcon, TrashIcon, ResizeIcon, SaveIcon, FolderIcon, DragHandleIcon, RotateIcon, ColorSwatchIcon, BranchIcon, ChevronDownIcon, ScissorsIcon } from './icons/Icons';

interface ActionStepProps {
  action: Action;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropZoneOver?: (e: React.DragEvent<HTMLDivElement>) => void;
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

const getActionDetails = (action: Action): { title: string; description: string; icon: React.ReactNode } => {
  switch (action.type) {
    case ActionType.RESIZE: {
      const config = (action as ResizeAction).config;
      let parts: string[] = [];
      if (config.mode === ResizeMode.LONGEST_EDGE && config.length) {
        parts.push(`Longest edge: ${config.length}${config.unit}`);
      } else {
        if (config.width) parts.push(`Width: ${config.width}${config.unit}`);
        if (config.height) parts.push(`Height: ${config.height}${config.unit}`);
      }
      if (config.resolution) parts.push(`Resolution: ${config.resolution} DPI`);

      const hasSave = !!config.saveConfig || (config.saveLogic === SaveLogic.CONDITIONAL && (!!config.conditionalSaveConfig?.onRGB || !!config.conditionalSaveConfig?.onCMYK));
      const title = hasSave ? 'Resize & Save' : 'Resize Image';
      
      let description = parts.length > 0 ? parts.join(', ') : "Configure resize details";
      
      if (config.saveLogic === SaveLogic.CONDITIONAL) {
          description += ' | Save: Conditional (RGB/CMYK)';
      } else if (config.saveConfig) {
          const saveConfig = config.saveConfig;
          description += ` | Save: ${saveConfig.format}`;
          if (saveConfig.format === 'TIFF' || saveConfig.format === 'PSD') {
              description += `, Layers: ${saveConfig.psdTiffLayers ? 'On' : 'Flattened'}`;
          }
          if (saveConfig.appendSuffix) {
            description += ` ("${saveConfig.appendSuffix}")`;
          }
          if (saveConfig.conflictResolution && saveConfig.conflictResolution !== FileNameConflictResolution.OVERWRITE) {
            const conflictMap: Record<string, string> = {
                [FileNameConflictResolution.PROMPT]: 'Ask',
                [FileNameConflictResolution.APPEND_SUFFIX]: 'Add Suffix'
            };
            description += `, On Conflict: ${conflictMap[saveConfig.conflictResolution]}`;
          }
      }

      return { title, description, icon: <ResizeIcon className="w-5 h-5 text-brand-blue" /> };
    }
    case ActionType.SAVE: {
      const config = (action as SaveAction).config;
      let description = `Format: ${config.format}`;
      if (config.format === 'JPEG' && config.jpegQuality) {
        description += `, Quality: ${config.jpegQuality}`;
      }
       if (config.format === 'TIFF' && config.tiffTransparency !== undefined) {
        description += `, Transparency: ${config.tiffTransparency ? 'On' : 'Off'}`;
      }
      if (config.format === 'TIFF' || config.format === 'PSD') {
        description += `, Layers: ${config.psdTiffLayers ? 'On' : 'Flattened'}`;
      }
      if (config.appendSuffix) {
        description += `, Suffix: "${config.appendSuffix}"`;
      }
      if (config.subfolder) {
        description += `, Subfolder: "${config.subfolder}"`;
      }
      if (config.conflictResolution && config.conflictResolution !== FileNameConflictResolution.OVERWRITE) {
        const conflictMap: Record<string, string> = {
            [FileNameConflictResolution.PROMPT]: 'Ask',
            [FileNameConflictResolution.APPEND_SUFFIX]: 'Add Suffix'
        };
        description += `, On Conflict: ${conflictMap[config.conflictResolution]}`;
      }
      return { title: 'Save Image', description, icon: <SaveIcon className="w-5 h-5 text-green-500" /> };
    }
    case ActionType.CREATE_FOLDER: {
      const config = (action as CreateFolderAction).config;
      return { 
        title: 'Create Folder', 
        description: `Folder Name: "${config.folderName}"`, 
        icon: <FolderIcon className="w-5 h-5 text-purple-400" /> 
      };
    }
    case ActionType.ROTATE: {
      const config = (action as RotateAction).config;
      let rotationText = '';
      switch (config.rotation) {
        case RotationType.CW_90:
          rotationText = '90° Clockwise';
          break;
        case RotationType.CCW_90:
          rotationText = '90° Counter-Clockwise';
          break;
        case RotationType.DEG_180:
          rotationText = '180°';
          break;
      }
      return { 
        title: 'Rotate Image', 
        description: `Rotation: ${rotationText}`, 
        icon: <RotateIcon className="w-5 h-5 text-yellow-500" /> 
      };
    }
    case ActionType.COLOR_MODE: {
      const config = (action as ColorModeAction).config;
      return { 
        title: 'Convert Color Mode', 
        description: `Target Profile: ${config.profile}`, 
        icon: <ColorSwatchIcon className="w-5 h-5 text-pink-500" /> 
      };
    }
    case ActionType.TRIM: {
        const config = (action as TrimAction).config;
        const basedOnMap: Record<TrimBasedOn, string> = {
            [TrimBasedOn.TRANSPARENT_PIXELS]: 'Transparency',
            [TrimBasedOn.TOP_LEFT_PIXEL_COLOR]: 'Top Left Color',
            [TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR]: 'Bottom Right Color'
        };
        const sides = [];
        if (config.top) sides.push('Top');
        if (config.bottom) sides.push('Bottom');
        if (config.left) sides.push('Left');
        if (config.right) sides.push('Right');

        const sidesText = sides.length > 0 ? `(${sides.join(', ')})` : '(None)';

        return {
            title: 'Trim Image',
            description: `Based on: ${basedOnMap[config.basedOn]} ${sidesText}`,
            icon: <ScissorsIcon className="w-5 h-5 text-orange-500" />
        };
    }
    case ActionType.CONDITION: {
      const config = (action as ConditionAction).config;
      return {
        title: 'Condition (If...Then)',
        description: getConditionText(config.condition),
        icon: <BranchIcon className="w-5 h-5 text-teal-400" />
      }
    }
    default:
      return { title: 'Unknown Action', description: 'Action not recognized', icon: null };
  }
};

const ActionStep: React.FC<ActionStepProps> = ({
  action,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDropZoneOver,
  onDragEnd,
  dropIndicator,
  level,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { title, description, icon } = getActionDetails(action);

  const isContainer = action.type === ActionType.CONDITION || action.type === ActionType.CREATE_FOLDER || action.type === ActionType.TRIM;

  const baseClasses = `bg-brand-gray-700 rounded-lg p-3 flex flex-col transition-all duration-200 border cursor-grab active:cursor-grabbing`;
  const stateClasses = isContainer
    ? `border-brand-gray-600 cursor-pointer ${dropIndicator === 'inside' ? 'border-brand-blue bg-brand-blue/10' : ''}`
    : `border-transparent hover:border-brand-blue ${dropIndicator === 'inside' ? 'border-brand-blue' : ''}`;

  return (
    <div
      style={{ marginLeft: level > 0 ? `${level * 2}rem` : '0' }}
      className="relative"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Drop indicator: BEFORE */}
      {dropIndicator === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full z-20 pointer-events-none" />
      )}

      {level > 0 && (
        <>
          <div className="absolute top-6 -left-4 w-4 h-px bg-brand-gray-600" />
          <div className="absolute -top-2 -left-4 h-[calc(50%)] w-px bg-brand-gray-600" />
          <div className="absolute top-6 -left-4 h-[calc(100%-1.5rem)] w-px bg-brand-gray-600" />
        </>
      )}

      <div className="flex flex-col">
        {/* Header — drag target for position detection */}
        <div
          className={`${baseClasses} ${stateClasses}`}
          onDragOver={onDragOver}
          onClick={isContainer ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <DragHandleIcon className="w-5 h-5 text-brand-gray-400 flex-shrink-0" />
              <div className="flex-shrink-0 w-8 h-8 bg-brand-gray-800 rounded-lg flex items-center justify-center">
                {icon}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="font-bold text-white truncate">{title}</p>
                <p className="text-sm text-brand-gray-300 truncate">{description}</p>
              </div>
              {isContainer && (
                <ChevronDownIcon className={`w-5 h-5 text-brand-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
              )}
            </div>
            <div className="flex items-center gap-1 pl-2">
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-full hover:bg-brand-gray-600 transition-colors">
                <EditIcon className="w-5 h-5 text-brand-gray-300" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-full hover:bg-brand-gray-600 transition-colors">
                <TrashIcon className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        </div>

        {isContainer && (
          <div className={`transition-[grid-template-rows] duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="pt-2 flex flex-col gap-2">
                {children}
                <div
                  className={`text-xs text-center border border-dashed rounded-md py-3 transition-colors ${dropIndicator === 'inside' ? 'border-brand-blue text-brand-blue bg-brand-blue/5' : 'border-brand-gray-600 text-brand-gray-500 bg-brand-gray-800/50'}`}
                  style={{ marginLeft: `${(level + 1) * 2}rem` }}
                  onDragOver={onDropZoneOver}
                >
                  Drop actions here to add to this container
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Drop indicator: AFTER */}
      {dropIndicator === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-blue rounded-full z-20 pointer-events-none" />
      )}
    </div>
  );
};

export default ActionStep;
