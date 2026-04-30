
import { GoogleGenAI, Type } from "@google/genai";
import { Action, ActionType, ResizeAction, SaveAction, CreateFolderAction, RotateAction, ColorModeAction, ResizeUnit, SaveFormat, ResizeMode, RotationType, ColorProfile, ConditionAction, ConditionProperty, ConditionOperator, Condition, SaveConfig, SaveLogic, FileNameConflictResolution, TrimAction, TrimBasedOn } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Prompt Generation Functions ---

const buildScriptPreamble = () => `
Generate a comprehensive and robust Adobe Photoshop script using JavaScript (ExtendScript),
targeting Photoshop 2022-2025 (v23-v26+). The script must use modern ExtendScript API patterns
that are fully compatible with the latest versions of Photoshop.
`;

const buildBestPracticesSection = () => `
// --- SCRIPT BEST PRACTICES ---
// author Ai and Sohl
// 1.  **Main Function**: The entire script must be wrapped in a self-executing anonymous function: 'main(); function main() { ... }'.
// 2.  **State Management**: The main logic inside 'main()' must be wrapped in a 'try...finally' block.
//     - At the start of 'try', store Photoshop's original 'rulerUnits' and 'displayDialogs' preferences.
//     - Immediately set 'app.displayDialogs = DialogModes.NO;' to suppress dialogs.
//     - Set 'app.preferences.rulerUnits = Units.PIXELS;' for consistency.
//     - The 'finally' block MUST restore the original preferences. This is critical for leaving Photoshop in its original state.
// 3.  **Avoid Undefined Constants**: Do NOT use constants like 'PNGFormat', 'JPEGFormat', or 'TIFFFormat'. These are NOT defined in standard ExtendScript. Do not try to assign a 'format' property to SaveOptions objects.
// 4.  **Saving Files (PS 2022+ Required)**: ALL calls to 'doc.saveAs()' MUST use the full 4-argument signature:
//     'doc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);'
//     The third argument 'asCopy = true' and fourth argument 'Extension.LOWERCASE' are MANDATORY for
//     Photoshop 2021+ (v22+). Without these, Photoshop may display a save dialog or alter the document's
//     saved state, even when 'DialogModes.NO' is set. NEVER call 'doc.saveAs(file, options)' with only 2 arguments.
`;

const buildCoreLogicSection = (outputFolderName: string) => `
// --- SCRIPT LOGIC ---
// 1.  **User Input**: Prompt the user to select an input folder. If cancelled, terminate gracefully.
// 2.  **Output Folder**: Create a subfolder named "${outputFolderName}" inside the input folder. This is the root output folder. Any actions that do not specify an absolute UNC path should use this as their base.
// 3.  **File Iteration**: Get a list of all image files (JPG, PNG, TIFF, PSD) from the input folder, ignoring subdirectories.
// 4.  **Counters & Logs**: Initialize an empty array 'errorLog' for errors and a 'successCount' counter to 0.
`;

const buildProgressBarSection = () => `
// --- PROGRESS BAR ---
// Before the file loop, create and display a progress bar window.
// Use the exact code structure provided below. Do not deviate from it.
// This structure uses a layout manager, which is the most reliable way.

var win = new Window("palette", "Processing Images");
win.orientation = "column";
win.alignChildren = "fill";
win.spacing = 10;
win.margins = 16;

// Add a group for the text and progress bar
var progressGroup = win.add("group");
progressGroup.orientation = "column";
progressGroup.alignChildren = "left";
progressGroup.spacing = 5;

var progressLabel = progressGroup.add("statictext", undefined, "Progress:");
var progressBar = progressGroup.add("progressbar", [0, 0, 300, 12], 0, 100); // CRITICAL: Explicit size
var statusText = progressGroup.add("statictext", [0, 0, 300, 20], "Initializing...", { truncate: 'middle' }); // CRITICAL: Explicit size and truncate

// Display the window
win.center();
win.show();
win.active = true; // Ensure window is active to receive updates

// The script MUST update 'progressBar.value' and 'statusText.text' inside the file processing loop.
// After each update inside the loop, call BOTH 'win.update()' AND 'app.refresh()' for real-time
// rendering in Photoshop 2023+ (v24+). Using only 'win.update()' is insufficient in newer versions.
// After the loop, the script MUST call 'win.close()'.
`;

const buildFileLoopSection = (actionSteps: string) => `
// --- FILE PROCESSING LOOP ---
// Iterate through each file. Inside the loop, for each file:
// 1. **Update Progress Bar**: Update the dynamic text ("Processing file [i+1] of [total]...") and the progress bar value. Redraw the window if needed.
//    statusText.text = "Processing (" + (i + 1) + "/" + files.length + "): " + file.name;
//    progressBar.value = (i + 1) / files.length * 100;
//    win.update();    // ScriptUI refresh
//    app.refresh();   // Required in Photoshop 2023+ (v24+) for real-time UI updates
// 2. **Process File**: Use the following robust 'try...catch...finally' structure for each file:
//
// var doc = null;
// try {
//   doc = app.open(file);
//
//   // --- Action Sequence ---
//   // Execute the following actions IN ORDER. Conditional blocks (if statements) and folder containers are crucial.
${actionSteps}
//
//   // If all actions succeed, increment the success counter.
//   successCount++;
//
// } catch (e) {
//   // If an error occurs (opening or processing), log a detailed error to the 'errorLog' array.
//   // The message must include the filename and the error details from 'e'.
// } finally {
//   // This block runs for every file, whether it succeeded or failed.
//   if (doc) {
//     // CRITICAL: Close the document WITHOUT saving changes to the original file.
//     doc.close(SaveOptions.DONOTSAVECHANGES);
//   }
// }
//
// End of the file processing loop.
`;

const buildCompletionSection = (outputFolderName: string) => `
// --- SCRIPT COMPLETION ---
// After the loop finishes:
// 1. **Close Progress Bar**: Close the progress bar window.
// 2. **Report Results**: Show a final alert with a detailed summary:
//    "Processing Complete.\\nSucceeded: " + successCount + " of " + totalFiles + ".\\nFailed: " + errorLog.length + "."
// 3. **Save Error Log**: If 'errorLog.length > 0', save a detailed 'error_log.txt' file inside the main "${outputFolderName}" directory with all collected error messages.
`;

const buildScriptCleanupSection = () => `
// --- SCRIPT CLEANUP ---
// Remember that the main 'finally' block must restore Photoshop's original settings.
The script must be well-commented.
`;


function buildCreateFolderDescription(action: CreateFolderAction, outputFolderName: string, parentPath: string = ''): string {
  const { folderName } = action.config;
  const isUNC = folderName.startsWith('\\\\');

  if (isUNC) {
    return `Create a folder at the absolute UNC path "${folderName}". The script must handle UNC pathing correctly (e.g., using forward slashes like '//server/share' or escaped backslashes). This action defines a new working directory for any nested save actions.`;
  }
  
  const targetDir = parentPath ? `${parentPath}/${folderName}` : folderName;
  const isParentUNC = parentPath.startsWith('\\\\');

  if (isParentUNC) {
      return `Create a new subfolder path "${targetDir}". The script must create this folder if it does not already exist. This action defines a new working directory for any nested save actions.`;
  }
  
  return `Create a new subfolder path "${targetDir}" relative to the main "${outputFolderName}" directory. The script must create this folder if it does not already exist. This action defines a new working directory for any nested save actions.`;
}

function buildRotateDescription(action: RotateAction): string {
  const { rotation } = action.config;
  let desc = 'Rotate the image. ';
  switch (rotation) {
    case RotationType.CW_90:
      desc += 'Rotate the canvas 90 degrees clockwise (e.g., doc.rotateCanvas(90)).';
      break;
    case RotationType.CCW_90:
      desc += 'Rotate the canvas 90 degrees counter-clockwise (e.g., doc.rotateCanvas(-90)).';
      break;
    case RotationType.DEG_180:
      desc += 'Rotate the canvas 180 degrees (e.g., doc.rotateCanvas(180)).';
      break;
  }
  return desc;
}

function buildTrimDescription(action: TrimAction): string {
    const { basedOn, top, bottom, left, right } = action.config;
    let trimType;
    switch (basedOn) {
        case TrimBasedOn.TRANSPARENT_PIXELS: trimType = 'TrimType.TRANSPARENT'; break;
        case TrimBasedOn.TOP_LEFT_PIXEL_COLOR: trimType = 'TrimType.TOPLEFT'; break;
        case TrimBasedOn.BOTTOM_RIGHT_PIXEL_COLOR: trimType = 'TrimType.BOTTOMRIGHT'; break;
        default: trimType = 'TrimType.TRANSPARENT';
    }

    const topBool = top ? 'true' : 'false';
    const leftBool = left ? 'true' : 'false';
    const bottomBool = bottom ? 'true' : 'false';
    const rightBool = right ? 'true' : 'false';

    return `Trim the document using the 'doc.trim()' method.
    - Based On: ${trimType}
    - Trim Top: ${topBool}
    - Trim Left: ${leftBool}
    - Trim Bottom: ${bottomBool}
    - Trim Right: ${rightBool}
    Code: \`doc.trim(${trimType}, ${topBool}, ${leftBool}, ${bottomBool}, ${rightBool});\``;
}

function buildColorModeDescription(action: ColorModeAction): string {
  const { profile } = action.config;
  return `Convert the document's color profile to ${profile}. For example, for CMYK, use 'app.activeDocument.changeMode(ChangeMode.CMYK)'. IMPORTANT: If the conversion requires flattening the image, the script must proceed with flattening automatically to complete the conversion.`;
}


function buildResizeDescription(action: ResizeAction, outputFolderName: string, parentPath: string = ''): string {
  const { mode, width, height, length, unit, maintainAspectRatio, resolution, saveConfig, saveLogic, conditionalSaveConfig } = action.config;
  let desc = 'Resize the image. ';

  if (mode === ResizeMode.LONGEST_EDGE && length) {
    desc += `Resize the image so its longest edge is ${length}${unit}. The aspect ratio must be maintained. `;
  } else { // DIMENSIONS mode
    if (width && height) {
      desc += `Set dimensions to ${width}${unit} width and ${height}${unit} height. `;
    } else if (width) {
      desc += `Set width to ${width}${unit}. `;
    } else if (height) {
      desc += `Set height to ${height}${unit}. `;
    }
    
    if (maintainAspectRatio) {
        desc += 'Maintain the aspect ratio. ';
    }
  }

  if (resolution) {
    desc += `Set the resolution to ${resolution} DPI. `;
  }
  
  desc += 'For the resampling method, use the best option for Photoshop 2024+ (v25+): ' +
    'If the new dimensions are LARGER than the original (upscaling), use `ResampleMethod.PRESERVE_DETAILS_2`. ' +
    'If the new dimensions are SMALLER than the original (downscaling), use `ResampleMethod.BICUBIC_SHARPER`. ' +
    'If it cannot be determined whether upscaling or downscaling will occur at runtime (e.g. percentage resize), ' +
    'compare dimensions at runtime and branch accordingly. ' +
    'The script must call it like this: `doc.resizeImage(newWidth, newHeight, resolution, resampleMethod)`. ' +
    'CRITICAL: Do NOT provide a fifth argument to `resizeImage`. ';

  if (saveLogic === SaveLogic.CONDITIONAL && conditionalSaveConfig) {
      desc += 'After resizing, perform a conditional save based on the document color mode. Generate an if/else block for this logic.\n';
      if (conditionalSaveConfig.onRGB) {
        const rgbSaveDesc = buildSaveDescription({ type: ActionType.SAVE, config: conditionalSaveConfig.onRGB, id: '' }, outputFolderName, parentPath);
        desc += `  - **For RGB documents (inside \`if (doc.mode === DocumentMode.RGB)\`)**: ${rgbSaveDesc}\n`;
      }
      if (conditionalSaveConfig.onCMYK) {
        const cmykSaveDesc = buildSaveDescription({ type: ActionType.SAVE, config: conditionalSaveConfig.onCMYK, id: '' }, outputFolderName, parentPath);
        desc += `  - **For CMYK documents (inside an \`else if (doc.mode === DocumentMode.CMYK)\` or \`else\` block)**: ${cmykSaveDesc}`;
      }
  } else if (saveConfig) {
      desc += 'After resizing, immediately perform the following save action: '
      desc += buildSaveDescription({ type: ActionType.SAVE, config: saveConfig, id: '' }, outputFolderName, parentPath);
  }

  return desc;
}

const DUPLICATE_FLATTEN_SAVE_CLOSE = `To ensure stability, use this process:
1. Duplicate the active document.
2. Flatten the duplicate.
3. Save the flattened duplicate with the specified options.
4. Close the duplicate without saving changes.
This prevents altering the original multi-layer document state for subsequent actions.`;

function buildSaveDescription(action: SaveAction, outputFolderName: string, parentPath: string = ''): string {
  const { format, jpegQuality, tiffCompression, tiffTransparency, appendSuffix, subfolder, psdTiffLayers, conflictResolution = FileNameConflictResolution.OVERWRITE } = action.config;
  // CRITICAL FIX: Default pngTransparency to TRUE if undefined. The UI defaults to showing it checked, so we must treat undefined as checked.
  const pngTransparency = action.config.pngTransparency ?? true;

  let desc = `Save a copy of the processed image. `;
  
  const isSubfolderUNC = subfolder?.startsWith('\\\\');
  
  if (isSubfolderUNC) {
      desc += `The file should be saved in the absolute UNC path "${subfolder}". The script must create this folder path if it does not exist and handle UNC pathing correctly (e.g., using forward slashes like '//server/share' or escaped backslashes). `;
  } else {
      let finalPath = parentPath;
      if (subfolder) {
          finalPath = parentPath ? `${parentPath}/${subfolder}` : subfolder;
      }
      
      if (finalPath) {
        const isParentUNC = parentPath.startsWith('\\\\');
        if (isParentUNC) {
            desc += `The file should be saved in the path "${finalPath}". The script must create this entire subfolder path if it does not already exist. `;
        } else {
            desc += `The file should be saved in a subfolder path "${finalPath}" relative to the main "${outputFolderName}" directory. The script must create this entire subfolder path if it does not already exist. `;
        }
      } else {
        desc += `The file should be saved in the main "${outputFolderName}" directory that was created inside the input directory. `;
      }
  }
  
  if (appendSuffix) {
    desc += `Append the suffix "${appendSuffix}" to the original filename. `;
  } else {
    desc += `Use the original filename. `;
  }

  desc += `The format should be ${format}. `;

  switch (format) {
    case SaveFormat.JPEG:
      desc += `Use a JPEG quality of ${jpegQuality}. Because JPEGs do not support layers, the image must be flattened. ${DUPLICATE_FLATTEN_SAVE_CLOSE}`;
      break;
    case SaveFormat.PNG:
      desc += "CRITICAL INCOMPATIBILITY HANDLING: Before attempting to save as PNG, you MUST check if the document is in CMYK mode (`doc.mode === DocumentMode.CMYK`). If it is, you MUST automatically convert the document to RGB mode (`doc.changeMode(ChangeMode.RGB)`) before proceeding with the save. This is a non-negotiable, automatic conversion; do not prompt the user. After this potential conversion, proceed with the standard PNG save logic: ";
      
      desc += `Use PNG-24 format. `;

      if (pngTransparency) {
          desc += `Save with transparency ENABLED.
          CRITICAL: To preserve transparency, DO NOT use 'doc.flatten()' because it replaces transparent areas with a white background.
          Instead, use this process:
          1. Duplicate the active document.
          2. Check if there is more than one layer: \`if (dupDoc.layers.length > 1) { dupDoc.mergeVisibleLayers(); }\`. This prevents errors if the document has only one layer.
          3. CRITICAL: Ensure the resulting single layer is NOT a 'Background' layer (which does not support transparency). In Photoshop 2024+ this setter can fail, so it MUST be wrapped in try-catch: \`try { if (dupDoc.activeLayer.isBackgroundLayer) { dupDoc.activeLayer.isBackgroundLayer = false; } } catch(e) {}\`.
          4. Create PNGSaveOptions. Set \`pngSaveOptions.transparency = true\` and explicitly set \`pngSaveOptions.interlaced = false\` (required for Photoshop 2023+ compatibility).
          5. Save the duplicate using: \`dupDoc.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);\`
          6. Close the duplicate without saving changes.`;
      } else {
          desc += 'Save with transparency disabled. ';
          desc += `Because PNGs do not support layers, the image must be flattened. ${DUPLICATE_FLATTEN_SAVE_CLOSE} `;
          desc += 'When creating PNGSaveOptions, explicitly set `pngSaveOptions.interlaced = false` (required for Photoshop 2023+ compatibility). ';
          desc += 'Save using: `dupDoc.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);`';
      }
      break;
    case SaveFormat.TIFF:
        const compression = tiffCompression || 'LZW';
        const compressionConstant = { 'NONE': 'NONE', 'LZW': 'TIFFLZW', 'ZIP': 'TIFFZIP' }[compression];
        const preserveTiffTransparency = tiffTransparency;
        const flattenTiff = !psdTiffLayers;

        // Helper text for handling transparency vs flattening
        const flattenInstruction = preserveTiffTransparency 
            ? "Check if there is more than one layer: \`if (doc.layers.length > 1) { doc.mergeVisibleLayers(); }\`. Then, ensure transparency is supported: \`if (doc.activeLayer.isBackgroundLayer) { doc.activeLayer.isBackgroundLayer = false; }\`. DO NOT use 'doc.flatten()'." 
            : "Flatten the duplicate (doc.flatten()).";

        const transparencyOpt = preserveTiffTransparency ? "tiffSaveOptions.transparency = true;" : "tiffSaveOptions.transparency = false;";

        desc += `Use ${compression} compression. `;
        desc += `To prevent errors, you MUST generate a strict 'if/else' block to handle CMYK documents separately.

**PATH 1: \`if (doc.mode === DocumentMode.CMYK)\`**
This logic is for CMYK files ONLY.
*   **Procedure:** A CMYK TIFF MUST ALWAYS be saved by duplicating the document. ${flattenInstruction} Then save the duplicate, and close it.
*   **Save Options:** Create a \`TiffSaveOptions\` object. Set ONLY these properties:
    1.  \`imageCompression = TIFFEncoding.${compressionConstant};\`
    2.  \`byteOrder = ByteOrder.IBM;\`
    3.  \`embedColorProfile = true;\`
    4.  ${transparencyOpt}
*   **CRITICAL:** DO NOT add options for \`layers\` or \`alphaChannels\` for CMYK unless absolutely necessary.

**PATH 2: \`else\` (for all other color modes like RGB)**
This logic is for non-CMYK files.
*   **Procedure:** ALWAYS use the duplicate-save-close pattern. NEVER save the active document directly in Photoshop 2022+ as this can trigger an unwanted save dialog.
    1. Duplicate the document.
    2. ${flattenInstruction}
    3. Save the duplicate using: \`dupDoc.saveAs(saveFile, tiffSaveOptions, true, Extension.LOWERCASE);\`
    4. Close the duplicate without saving changes.
*   **Save Options:** Create a \`TiffSaveOptions\` object and set the base properties.
    *   ${transparencyOpt}
    *   If layers should be preserved (\`${!flattenTiff}\`) AND the document has more than one layer, set \`tiffSaveOptions.layers = true;\`.
    *   If transparency should be preserved (\`${preserveTiffTransparency}\`) AND the document has alpha channels, set \`tiffSaveOptions.alphaChannels = true;\`.
`;
        break;
    case SaveFormat.PSD:
      desc += 'Save as a standard PSD file. ';
      if (psdTiffLayers) {
        desc += `The layers of the document must be preserved. Use this process:
          1. Duplicate the active document.
          2. Create a \`PhotoshopSaveOptions\` object and set \`psdSaveOptions.layers = true;\`.
          3. Save the duplicate using: \`dupDoc.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);\`
          4. Close the duplicate without saving changes.
          IMPORTANT: NEVER save the active document directly in Photoshop 2022+, always use the duplicate-and-asCopy approach.`;
      } else {
        desc += `The image must be flattened before saving. ${DUPLICATE_FLATTEN_SAVE_CLOSE} `;
        desc += 'Save the duplicate using: `dupDoc.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);`';
      }
      break;
  }

  desc += `\n\n**Filename Conflict Handling**: `;
  switch (conflictResolution) {
    case FileNameConflictResolution.PROMPT:
      desc += `If a file with the target name already exists, the script MUST use the built-in 'prompt()' dialog to ask the user for a new filename. The prompt should show the conflicting name ('file.name' already exists. Enter a new name:') and suggest the original name as the default. If the user cancels the prompt (returns null), the save operation for this file MUST be skipped. The script must be in a loop to re-prompt if the new name provided also exists.`;
      break;
    case FileNameConflictResolution.APPEND_SUFFIX:
      desc += `If a file with the target name already exists, the script must find a unique filename by appending an incrementing number before the extension (e.g., 'filename_1.ext', 'filename_2.ext'). It MUST loop and check for the existence of each new name until it finds one that is available.`;
      break;
    case FileNameConflictResolution.OVERWRITE:
    default:
      desc += `If a file with the target name already exists, it MUST be overwritten silently.`;
      break;
  }
  return desc;
}

function buildConditionString(condition: Condition): string {
  const { property, operator, value } = condition;
  let propString = '';
  switch (property) {
    case ConditionProperty.WIDTH: propString = 'doc.width.as("px")'; break;
    case ConditionProperty.HEIGHT: propString = 'doc.height.as("px")'; break;
    case ConditionProperty.FILENAME: propString = 'doc.name'; break;
    case ConditionProperty.FILETYPE: propString = 'doc.name.split(".").pop().toLowerCase()'; break;
    case ConditionProperty.COLOR_MODE: propString = 'doc.mode === DocumentMode.CMYK ? "CMYK" : (doc.mode === DocumentMode.RGB ? "RGB" : "OTHER")'; break;
  }

  let opString = '';
  const valString = typeof value === 'string' ? `"${value}"` : value;

  switch (operator) {
    case ConditionOperator.GREATER_THAN: opString = '>'; break;
    case ConditionOperator.LESS_THAN: opString = '<'; break;
    case ConditionOperator.CONTAINS: return `${propString}.indexOf(${valString}) > -1`;
    case ConditionOperator.DOES_NOT_CONTAIN: return `${propString}.indexOf(${valString}) === -1`;
    case ConditionOperator.IS: opString = '==='; break;
    case ConditionOperator.IS_NOT: opString = '!=='; break;
  }
  
  return `${propString} ${opString} ${valString}`;
}

function buildPromptFromActions(actions: Action[], outputFolderName: string, parentPath: string = '', level = 0): string {
  const indent = '  '.repeat(level);

  return actions.map((action, index) => {
    let stepDescription = `${indent}${index + 1}. `;
    
    switch (action.type) {
      case ActionType.RESIZE:
        stepDescription += `**RESIZE Action**: ${buildResizeDescription(action as ResizeAction, outputFolderName, parentPath)}`;
        break;
      case ActionType.SAVE:
        stepDescription += `**SAVE Action**: ${buildSaveDescription(action as SaveAction, outputFolderName, parentPath)}`;
        break;
      case ActionType.CREATE_FOLDER:
        const cfAction = action as CreateFolderAction;
        const isUNC = cfAction.config.folderName.startsWith('\\\\');
        const newPath = isUNC 
            ? cfAction.config.folderName 
            : (parentPath ? `${parentPath}/${cfAction.config.folderName}` : cfAction.config.folderName);
        const thenPrompt = buildPromptFromActions(cfAction.then, outputFolderName, newPath, level + 1);
        stepDescription += `**CONTAINER: CREATE_FOLDER**: ${buildCreateFolderDescription(cfAction, outputFolderName, parentPath)} Then, execute the following nested steps, with all save operations targeting the newly created "${cfAction.config.folderName}" folder:\n${thenPrompt}`;
        break;
      case ActionType.ROTATE:
        stepDescription += `**ROTATE Action**: ${buildRotateDescription(action as RotateAction)}`;
        break;
      case ActionType.COLOR_MODE:
        stepDescription += `**COLOR_MODE Action**: ${buildColorModeDescription(action as ColorModeAction)}`;
        break;
      case ActionType.TRIM:
        const trimDesc = buildTrimDescription(action as TrimAction);
        const trimThenPrompt = buildPromptFromActions((action as TrimAction).then, outputFolderName, parentPath, level + 1);
        stepDescription += `**CONTAINER: TRIM Action (ISOLATED)**:
        This container creates a temporary scope where the image is trimmed.
        1. Store the current history state of the document: \`var savedState = doc.activeHistoryState;\`
        2. Execute the Trim operation: ${trimDesc}
        3. Execute the following nested steps (which will operate on the trimmed image):\n${trimThenPrompt}
        4. CRITICAL: Restore the document to the stored history state: \`doc.activeHistoryState = savedState;\`. This ensures that the trim operation is undone before proceeding to any actions outside this container.`;
        break;
      case ActionType.CONDITION:
        const conditionAction = action as ConditionAction;
        const conditionString = buildConditionString(conditionAction.config.condition);
        const thenPromptCondition = buildPromptFromActions(conditionAction.then, outputFolderName, parentPath, level + 1);
        stepDescription += `**CONDITION**: Construct an 'if (${conditionString}) { ... }' block. Inside this block, execute the following nested steps:\n${thenPromptCondition}`;
        break;
      default:
        stepDescription += 'Unknown action.';
    }
    return stepDescription;
  }).join('\n');
}

// --- API Call Functions ---

export async function generateScriptPrompt(actions: Action[], outputFolderName: string): Promise<string> {
  const actionSteps = buildPromptFromActions(actions, outputFolderName, '');

  const fullPrompt = `
${buildScriptPreamble()}
${buildBestPracticesSection()}
${buildCoreLogicSection(outputFolderName)}
${buildProgressBarSection()}
${buildFileLoopSection(actionSteps)}
${buildCompletionSection(outputFolderName)}
${buildScriptCleanupSection()}
`;
  
  console.log("Generated Prompt for Gemini:", fullPrompt);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
    });
    
    const text = response.text;
    const codeBlockMatch = text.match(/```(?:javascript|jsx)\n([\s\S]*?)```/);
    
    let script: string;
    if (codeBlockMatch && codeBlockMatch[1]) {
      script = codeBlockMatch[1].trim();
    } else {
      // Fallback if no code block is found, assume the whole response is the script
      script = text.trim();
    }

    // Stability check: Ensure the output is likely a valid script before returning
    if (!script.includes('function main()') || !script.includes('app.open(')) {
        console.error("Generated script appears invalid:", script);
        throw new Error("The AI failed to generate a valid script structure. Please try again or adjust your steps.");
    }

    return script;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("The AI failed")) {
        throw error;
    }
    console.error("Error calling Gemini API:", error);

    let errorMessage = "An unknown error occurred while generating the script.";
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes("api key not valid")) {
            errorMessage = "Authentication failed. Please check if your API key is configured correctly.";
        } else if (lowerCaseMessage.includes("rate limit")) {
            errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
        } else if (lowerCaseMessage.includes("content has been blocked") || lowerCaseMessage.includes("candidate was blocked")) {
            errorMessage = "The request was blocked due to content safety policies. Please adjust your steps or try again.";
        } else {
            errorMessage = "Failed to generate script from Gemini API. Please try again later.";
        }
    }
    
    throw new Error(errorMessage);
  }
}

const saveConfigSchema = {
    type: Type.OBJECT,
    properties: {
        format: { type: Type.STRING, enum: Object.values(SaveFormat) },
        jpegQuality: { type: Type.INTEGER, nullable: true },
        pngTransparency: { type: Type.BOOLEAN, nullable: true },
        tiffCompression: { type: Type.STRING, enum: ['NONE', 'LZW', 'ZIP'], nullable: true },
        tiffTransparency: { type: Type.BOOLEAN, nullable: true },
        psdTiffLayers: { type: Type.BOOLEAN, nullable: true },
        appendSuffix: { type: Type.STRING, nullable: true },
        subfolder: { type: Type.STRING, nullable: true },
        conflictResolution: { type: Type.STRING, enum: Object.values(FileNameConflictResolution), nullable: true },
    },
    required: ['format'],
};


const actionConfigProperties = {
    // ResizeAction
    mode: { type: Type.STRING, enum: Object.values(ResizeMode), nullable: true },
    width: { type: Type.INTEGER, nullable: true },
    height: { type: Type.INTEGER, nullable: true },
    length: { type: Type.INTEGER, nullable: true },
    unit: { type: Type.STRING, enum: Object.values(ResizeUnit), nullable: true },
    maintainAspectRatio: { type: Type.BOOLEAN, nullable: true },
    resolution: { type: Type.INTEGER, nullable: true },
    saveConfig: { ...saveConfigSchema, nullable: true },
    // SaveAction
    format: { type: Type.STRING, enum: Object.values(SaveFormat), nullable: true },
    jpegQuality: { type: Type.INTEGER, nullable: true },
    pngTransparency: { type: Type.BOOLEAN, nullable: true },
    tiffCompression: { type: Type.STRING, enum: ['NONE', 'LZW', 'ZIP'], nullable: true },
    tiffTransparency: { type: Type.BOOLEAN, nullable: true },
    psdTiffLayers: { type: Type.BOOLEAN, nullable: true },
    appendSuffix: { type: Type.STRING, nullable: true },
    subfolder: { type: Type.STRING, nullable: true },
    conflictResolution: { type: Type.STRING, enum: Object.values(FileNameConflictResolution), nullable: true },
    // CreateFolderAction
    folderName: { type: Type.STRING, nullable: true },
    // RotateAction
    rotation: { type: Type.STRING, enum: Object.values(RotationType), nullable: true },
    // ColorModeAction
    profile: { type: Type.STRING, enum: Object.values(ColorProfile), nullable: true },
    // TrimAction
    basedOn: { type: Type.STRING, enum: Object.values(TrimBasedOn), nullable: true },
    top: { type: Type.BOOLEAN, nullable: true },
    bottom: { type: Type.BOOLEAN, nullable: true },
    left: { type: Type.BOOLEAN, nullable: true },
    right: { type: Type.BOOLEAN, nullable: true },
     // ConditionAction
    condition: {
        type: Type.OBJECT,
        nullable: true,
        properties: {
            property: { type: Type.STRING, enum: Object.values(ConditionProperty) },
            operator: { type: Type.STRING, enum: Object.values(ConditionOperator) },
            value: { type: Type.ONE_OF, oneOf: [{type: Type.STRING}, {type: Type.INTEGER}] },
        }
    },
};

// To handle nested actions without circular references, we define schemas for different depths.
// This allows the model to correctly parse scripts with nested containers.

// Level 2: An action that CANNOT have nested actions. This is the deepest level supported.
const actionSchemaLevel2 = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: Object.values(ActionType) },
        config: { type: Type.OBJECT, properties: actionConfigProperties },
    },
    required: ['type', 'config'],
};

// Level 1: An action that CAN have nested actions, but its children must be Level 2 (no deeper nesting).
const actionSchemaLevel1 = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: Object.values(ActionType) },
        config: { type: Type.OBJECT, properties: actionConfigProperties },
        then: { type: Type.ARRAY, items: actionSchemaLevel2, nullable: true },
    },
    required: ['type', 'config'],
};

// Top Level (Level 0): An action whose children can be Level 1. This allows for two levels of nesting total.
const actionSchema: any = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: Object.values(ActionType) },
        config: { type: Type.OBJECT, properties: actionConfigProperties },
        then: { type: Type.ARRAY, items: actionSchemaLevel1, nullable: true },
    },
    required: ['type', 'config'],
};


const parsingSchema = {
    type: Type.OBJECT,
    properties: {
        outputFolderName: { type: Type.STRING },
        actions: {
            type: Type.ARRAY,
            items: actionSchema,
        },
    },
    required: ['outputFolderName', 'actions'],
};

function validateParsedData(data: any): data is { outputFolderName: string; actions: Omit<Action, 'id'>[] } {
    if (typeof data !== 'object' || data === null) return false;
    if (typeof data.outputFolderName !== 'string' || data.outputFolderName.trim() === '') return false;
    if (!Array.isArray(data.actions)) return false;
    
    const validateActions = (actions: any[]): boolean => {
        for (const action of actions) {
            if (typeof action !== 'object' || action === null || !action.type || !action.config) {
                return false;
            }
            if (!Object.values(ActionType).includes(action.type)) {
                return false;
            }
            // Check for container actions
            if (action.type === ActionType.CONDITION || action.type === ActionType.CREATE_FOLDER || action.type === ActionType.TRIM) {
                // Allow 'then' to be undefined or null, as the parser might omit it if empty.
                // However, if it IS present, it MUST be an array of valid actions.
                if (action.then !== undefined && action.then !== null) {
                     if (!Array.isArray(action.then) || !validateActions(action.then)) {
                        return false;
                     }
                }
            }
        }
        return true;
    };

    return validateActions(data.actions);
}

function assignRandomIds(actions: Omit<Action, 'id'>[]): Action[] {
    return actions.map((action: any) => {
        const newAction = {
            ...action,
            id: crypto.randomUUID(),
        };
        // Check for container types and ensure 'then' is initialized as an array if missing
        if (newAction.type === ActionType.CONDITION || newAction.type === ActionType.CREATE_FOLDER || newAction.type === ActionType.TRIM) {
             if (newAction.then) {
                newAction.then = assignRandomIds(newAction.then);
             } else {
                newAction.then = []; // Initialize empty array for safety
             }
        }
        return newAction;
    });
}

export async function parseScriptToActions(scriptContent: string): Promise<{ outputFolderName: string; actions: Action[] }> {
  const prompt = `
    Analyze the following Adobe Photoshop ExtendScript code. Your task is to extract the main output folder name and the sequence of actions performed on each image, including any conditional logic and folder creation containers.
    Return a single JSON object that strictly adheres to the provided schema.

    **Analysis Instructions:**
    1.  **outputFolderName**: Extract the name of the main output directory created inside the user-selected input folder.
    2.  **actions**: Analyze the file processing loop. Identify each action in order. This is critical.
    3.  **Containers (Conditional & Folder)**:
        *   **If statements**: If you find an \`if\` block, create a "CONDITION" action. Analyze the condition inside the \`if (...)\` to determine the "property", "operator", and "value". Recursively analyze all actions inside the block and place them in the "then" array.
        *   **Folder Creation**: If you identify code that creates a folder (e.g., \`new Folder(path).create()\`) and then subsequent save actions use that folder as a base path, represent this as a "CREATE_FOLDER" action. All actions that logically belong inside that folder (like saving into it) must be nested within the "then" array of the "CREATE_FOLDER" action.
        *   **Trim**: Identify the "TRIM" action as a container. The generated code will typically save the history state, perform \`doc.trim(...)\`, execute nested actions, and then restore the history state. Map the actions inside this restore block to the "then" array.
    4.  **Resize & Save Combination**: If a save operation immediately follows a resize operation, combine them into a single "RESIZE" action with a nested "saveConfig" object. This includes complex cases where a resize is followed by an \`if/else\` block for saving based on color mode; represent this as a "RESIZE" action with "saveLogic: 'CONDITIONAL'" and populate the "conditionalSaveConfig".
    5.  **Parameter Extraction**: For each action, meticulously extract all its configuration parameters. If a parameter isn't present, omit its key.
        *   For "SAVE", identify format, quality, transparency, compression, suffix, and subfolder. If a save path is built by concatenating folder names, correctly identify the final subfolder. If the path is a UNC path (e.g., '//server/share'), extract it as an absolute path.
        *   For TIFF/PSD saves, check for layer preservation (\`psdTiffLayers: true\`) vs. flattening (\`psdTiffLayers: false\`).
        *   For "ROTATE", convert angles like \`90\` to \`CW_90\` and \`-90\` to \`CCW_90\`.
        *   For "TRIM", identify checks for \`doc.trim(...)\`. Map the parameters to "basedOn" (TrimType), "top", "bottom", "left", and "right".
    6.  **Conflict Handling**: For any save operation, determine the filename conflict strategy. Look for checks like \`File(path).exists\`. If it's followed by a \`prompt()\` dialog, set \`"conflictResolution": "PROMPT"\`. If it's followed by a loop that appends an incrementing suffix (e.g., "_1", "_2"), set \`"conflictResolution": "APPEND_SUFFIX"\`. If there is no existence check and the file is saved directly, assume \`"conflictResolution": "OVERWRITE"\`.
    7.  **JSON Output**: Construct the JSON object based on your findings. The structure, including nesting for conditions and folders, must exactly match the schema. Do not include any extra text or explanations.

    **Script to Analyze:**
    \`\`\`javascript
    ${scriptContent}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: parsingSchema,
      }
    });
    
    let parsedJson;
    try {
        parsedJson = JSON.parse(response.text);
    } catch (jsonError) {
        console.error("Gemini response was not valid JSON:", response.text);
        throw new Error("Script analysis failed: The model returned an invalid format. Please try again.");
    }

    if (!validateParsedData(parsedJson)) {
        console.error("Parsed JSON does not match expected schema:", parsedJson);
        throw new Error("Script analysis failed: The script's structure could not be recognized. Please ensure it is a script generated by this tool.");
    }
    
    const actionsWithIds = assignRandomIds(parsedJson.actions);
    return { ...parsedJson, actions: actionsWithIds };

  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Script analysis failed:")) {
        throw error; // Re-throw the specific, user-friendly error
    }
    console.error("Error parsing script with Gemini API:", error);
    
    let errorMessage = "An unknown error occurred while analyzing the script.";
    if (error instanceof Error) {
        const lowerCaseMessage = error.message.toLowerCase();
        if (lowerCaseMessage.includes("api key not valid")) {
            errorMessage = "Authentication failed. Please check if your API key is configured correctly.";
        } else if (lowerCaseMessage.includes("rate limit")) {
            errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
        } else if (lowerCaseMessage.includes("content has been blocked") || lowerCaseMessage.includes("candidate was blocked")) {
            errorMessage = "The script could not be analyzed due to content safety policies. Please check your input.";
        } else {
            errorMessage = "An error occurred while communicating with the AI model. Please check your internet connection and try again.";
        }
    }

    throw new Error(errorMessage);
  }
}
