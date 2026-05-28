Fra idé til færdigt Photoshop-script på under et minut — uden at skrive en linje kode.

Træt af at klikke det samme igennem i Photoshop hundrede gange? Photoshop Script Generator lader dig opbygge avancerede batch-workflows i en simpel drag-and-drop editor — resize, save, rotate, color mode, trim, flatten, metadata, betingede regler — og lader Claude AI skrive den rene, robuste ExtendScript-kode for dig. Resultat: en .jsx-fil du kører fra File → Scripts → Browse... i Photoshop 2022–2026, og som kan processere hundredevis af billeder mens du laver kaffe.

Fordele
⚡ Lynhurtig — komplekse multi-trins workflows på minutter, ikke timer
🎯 Ingen kode-erfaring — visuelt drag-and-drop interface
🤖 Drevet af Claude AI — ren, moderne ExtendScript der virker first-time
🔀 Conditional logic — forskellige trin afhængig af bredde, højde, filnavn, color mode
📂 Smart folder-håndtering — undermapper og filkonflikt-håndtering
🔄 Importer eksisterende scripts — AI'en parser gamle .jsx-filer tilbage til redigerbare actions
🎨 Optimeret til Photoshop 2022–2026 — ingen forældede konstanter
💾 Alle formater — JPEG, PNG, TIFF, PSD med fuld kontrol over kvalitet og lag
🏷️ Metadata & rename — sæt title/author/copyright og omdøb filer i samme proces

Hvad appen kan
Handling	Funktion
Resize	Faste dimensioner, procent eller længste kant + DPI
Save	JPEG/PNG/TIFF/PSD med format-specifikke indstillinger
Create Folder	Undermapper med actions inden i
Rotate	90° CW/CCW eller 180°
Trim	Auto-crop på transparens eller baggrundsfarve
Color Mode	RGB, CMYK eller Grayscale
Condition	If/then logic
Flatten	Full flatten eller merge visible
Metadata & Rename	EXIF/XMP + filnavnsændringer

Brugsscenarier
Fotografer der leverer både print (CMYK TIFF) og web (sRGB JPEG)
Designere der genererer thumbnails og social crops i flere størrelser
Webshop-ejere der batch-konverterer produktbilleder
Bureauer der standardiserer asset-pipelines
Print-bureauer der automatiserer klargøring af blandede formater
Call-to-action
Prøv det — byg dit første script på under 2 minutter.
Spar timer hver uge. Lad AI skrive scriptet — du laver det kreative.





Welcome to the Script Generator!
Follow these simple steps to automate your Photoshop workflow.

Have a try: https://photoshop-final-script-generator.vercel.app/

1
Build Your Actions
Use the  buttons on the left to add steps like 'Resize', 'Save', or 'Create Folder' to build your script.

2
Generate the Script
Once your steps are configured, click the  'Generate Script' button to let the AI write the code for you.

3
Copy or Download
Your script will appear here. Use the  copy or  download button to get the .jsx file.

4
Run in Photoshop
In Photoshop, go to File > Scripts > Browse... and select your downloaded file to run the automation.

-----

Resize
Scale the image to fixed dimensions (width × height), a percentage, or so the longest edge fits a given size. Set DPI and choose whether to maintain the aspect ratio.

Save
Export the image as JPEG, PNG, TIFF, or PSD. Configure quality, transparency, compression, and optionally add a filename suffix or subfolder to the output path.

Folder
Create a subfolder inside the output folder. Actions placed inside the folder step automatically save there — useful for splitting output into categories.

Rotate
Rotate the image 90° clockwise, 90° counter-clockwise, or 180°.

Trim
Automatically crop edges based on transparency or background colour. Choose which sides (top, bottom, left, right) to trim. Actions placed inside operate on the trimmed image — the original edges are restored afterwards.

Color Mode
Convert the colour space to RGB, CMYK, or Grayscale. Typically used before saving to a format with specific requirements, e.g. CMYK for print.

Condition
Add conditional logic (if/then). Actions placed inside only run when the condition is met — e.g. "only if width > 2000 px" or "only if filename contains 'web'".

Flatten
Merge all layers into one. Choose between a full flatten (transparent areas filled with the background colour) or Merge Visible Layers (transparency preserved).

Metadata & Rename
Update image metadata (title, author, copyright, description, keywords) and rename the output file — e.g. strip a numeric prefix ("123456 - "), add a prefix, or add a suffix.
