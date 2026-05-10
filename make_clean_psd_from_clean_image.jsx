// Photoshop Script: Select multiple *_clean images to convert to PSD
#target photoshop

function main() {
	var selectedFiles;

	// Cross-platform compatible multi-file picker
	if (File.fs === "Windows") {
		// Windows: "Description: *.ext;*.ext", multiSelect=true
		selectedFiles = File.openDialog("Select '_clean' images (Hold Ctrl/Shift to select multiple)", "Images: *_clean.jpg;*_clean.png;*_clean.jpeg", true);
	} else {
		// macOS: filter function, multiSelect=true
		var macFilter = function(file) {
			if (file instanceof Folder) return true;
			return /_clean\.(jpg|jpeg|png)$/i.test(file.name);
		};
		selectedFiles = File.openDialog("Select '_clean' images (Hold Cmd/Shift to select multiple)", macFilter, true);
	}

	// Exit if user canceled or selected nothing
	if (!selectedFiles || selectedFiles.length === 0) return;

	var psdOptions = new PhotoshopSaveOptions();
	psdOptions.layers = true;
	psdOptions.embedColorConfiguration = true;

	var processCount = 0;
	var skipCount = 0;

	for (var i = 0; i < selectedFiles.length; i++) {
		var currentFile = selectedFiles[i];

		// Safety check for suffix (especially on Windows where filtering can be bypassed)
		if (!/_clean\.(jpg|jpeg|png)$/i.test(currentFile.name)) {
			continue; 
		}

		var fileName = currentFile.name.replace(/\.[^\.]+$/, ""); 
		var targetFile = new File(currentFile.path + "/" + fileName + ".psd");

		// For multi-select, we skip existing files to avoid interrupting the flow with constant popups
		if (targetFile.exists) {
			skipCount++;
			continue;
		}

		var doc = open(currentFile);
		
		if (doc.mode !== DocumentMode.RGB) {
			doc.changeMode(ChangeMode.RGB);
		}

		doc.saveAs(targetFile, psdOptions, true, Extension.LOWERCASE);
		doc.close(SaveOptions.DONOTSAVECHANGES);
		processCount++;
	}

	var finalMsg = "Process complete!";
	finalMsg += "\nConverted: " + processCount;
	if (skipCount > 0) {
		finalMsg += "\nSkipped (already existed): " + skipCount;
	}
	
	alert(finalMsg);
}

main();