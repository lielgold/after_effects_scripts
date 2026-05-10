{
	function myScript(thisObj) {
		var btnExport, btnImport, btnExit;

		function buildUI(container) {
			var myPanel = (container instanceof Panel) ? container : new Window("palette", "Image Manager", undefined, {resizeable: true});
			myPanel.orientation = "column";
			myPanel.alignChildren = ["fill", "top"];
			myPanel.spacing = 10;
			myPanel.margins = 16;

			btnExport = myPanel.add("button", undefined, "Export as _clean and Duplicate Layers");
			
			var instructionText = myPanel.add("statictext", undefined, "Now run the Photoshop script named:\nmake_clean_psd_from_clean_image.jsx", {multiline: true});
			instructionText.alignment = ["center", "top"];
			instructionText.justify = "center";

			btnImport = myPanel.add("button", undefined, "Import Matching _clean PSDs");
			btnExit = myPanel.add("button", undefined, "exit");

			btnExport.onClick = function() { export_and_duplicate(); };
			btnImport.onClick = function() { import_psd(); };
			btnExit.onClick = function() { if (myPanel instanceof Window) myPanel.close(); };

			myPanel.layout.layout(true);
			return myPanel;
		}

		function getBaseName(fileName) {
			return fileName.replace(/\.(jpg|jpeg|png|psd)$/i, "").replace(/^\s+|\s+$/g, "");
		}

		function getExtension(fileName) {
			var match = fileName.match(/\.(jpg|jpeg|png)$/i);
			return match ? match[0] : null;
		}

		function export_and_duplicate() {
			try {
				var targetProj = app.project;
				var activeComp = targetProj.activeItem;
				if (!(activeComp instanceof CompItem)) { alert("Select a Comp."); return; }

				var targetLayers = activeComp.selectedLayers;
				var successCount = 0;
				
				app.beginUndoGroup("Export and Duplicate Clean Layers");

				for (var i = 0; i < targetLayers.length; i++) {
					var curLayer = targetLayers[i];
					if (!(curLayer.source instanceof FootageItem) || curLayer.source.file === null) continue;
					
					var originalFile = curLayer.source.file;
					var ext = getExtension(originalFile.name);
					if (!ext) continue; 

					var baseName = getBaseName(originalFile.name);
					var cleanName = baseName + "_clean" + ext;
					var destinationFile = new File(originalFile.parent.fsName + "/" + cleanName);

					if (originalFile.copy(destinationFile)) {
						var duplicatedLayer = curLayer.duplicate();
						var importedItem = targetProj.importFile(new ImportOptions(destinationFile));
						
						duplicatedLayer.replaceSource(importedItem, false);
						duplicatedLayer.name = cleanName;
						duplicatedLayer.moveBefore(curLayer);
						
						successCount++;
					}
				}
				app.endUndoGroup();
				if (successCount > 0) alert("Created " + successCount + " clean layers.");
			} catch (e) { alert(e.toString()); }
		}

		function import_psd() {
			try {
				var targetProj = app.project;
				var activeComp = targetProj.activeItem;
				if (!(activeComp instanceof CompItem)) { alert("Select a Comp."); return; }

				var targetLayers = activeComp.selectedLayers;
				var importCount = 0;

				app.beginUndoGroup("Swap JPG for PSD and Delete JPG");

				for (var i = 0; i < targetLayers.length; i++) {
					var curLayer = targetLayers[i];
					
					if (!(curLayer.source instanceof FootageItem) || curLayer.source.file === null) continue;

					var jpgFile = curLayer.source.file; // Reference the file before swapping
					var fileName = jpgFile.name;
					var ext = getExtension(fileName);

					if (ext && fileName.toLowerCase().indexOf("_clean" + ext.toLowerCase()) !== -1) {
						var parentPath = jpgFile.parent.fsName;
						var baseName = getBaseName(fileName);
						var psdFile = new File(parentPath + "/" + baseName + ".psd");

						if (psdFile.exists) {
							// 1. Import the PSD
							var importOptions = new ImportOptions(psdFile);
							var psdItem = targetProj.importFile(importOptions);
							
							// 2. Replace the source in the timeline
							curLayer.replaceSource(psdItem, false);
							curLayer.name = baseName + ".psd";
							
							// 3. Delete the _clean image file from the disk
							if (jpgFile.exists) {
								jpgFile.remove();
							}
							
							importCount++;
						}
					}
				}

				app.endUndoGroup();

				if (importCount > 0) {
					alert("Swapped " + importCount + " layers and deleted the temporary _clean image files.");
				} else {
					alert("No matching _clean PSD files found.");
				}

			} catch (e) {
				alert("Import failed: " + e.toString());
			}
		}
		
		var scriptPanel = buildUI(thisObj);
		if (scriptPanel instanceof Window) { scriptPanel.center(); scriptPanel.show(); }
	}
	myScript(this);
}