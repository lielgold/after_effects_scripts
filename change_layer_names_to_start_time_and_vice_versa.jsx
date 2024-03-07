// utility functions
// replace all letters a with letters b
function replaceAll(txt, a, b) {
    return txt.split(a).join(b);
}

// check if user selected layers to work on and get them and the active composition
function _check_if_layers_are_selected_and_get_them(){
	var comp = app.project.activeItem;
	
	if (comp==null){
		alert("You need to select an active composition to run the script on.");
		return;		
	}	
	
	// Get the layers
	var selected_layers = comp.selectedLayers;
	
	if (selected_layers==null){
		alert("You need to select what layers to run the script on.");
		return;
	}	
	return {layers:selected_layers,active_composition:comp};
	
}

// changes layer names to their start time.
// can also set it to work on inpoint instead of start time
function layer_names_to_start_time(){	
	// Get the active composition and selected layers	
	var a = _check_if_layers_are_selected_and_get_them();
	var comp = a.active_composition;
	var layers = a.layers;
	
	// this makes undo cancel all actions performed by this function as a group, so only one click is needed rather than several
	if(!dlg.checkbox_use_inPoint_instead_of_start_time.value) app.beginUndoGroup("Rename layer names to their start time")	
	else app.beginUndoGroup("Rename layers to inPoint time");
	
	// Loop through each layer	
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];	
		
		// change layer names to their start time or inPoint based on the user's input
		var time_to_codetime = null;
		if(!dlg.checkbox_use_inPoint_instead_of_start_time.value){ // checks whether to use layer inpoint instead of start time
			time_to_codetime = timeToCurrentFormat(layer.startTime + comp.displayStartTime, comp.frameRate);
		}
		else{
			time_to_codetime = timeToCurrentFormat(layer.inPoint + comp.displayStartTime, comp.frameRate);
		}
		
		// change : to ; in the timecode.
		// Previous versions of After effects used : in times codes, but this can cause issues when rendering a file since file names in Windows can't contain the letter : , so instead new versions of AE use ;
		time_to_codetime = replaceAll(time_to_codetime, ":", ";")		
		
		layer.name = time_to_codetime;
		if (!(layer instanceof TextLayer)) {
			layer.source.name = time_to_codetime;
		}
	}		
	app.endUndoGroup();
}

// changes layer start time their names
// can also set it to work on inpoint instead of start time
function start_times_to_layer_names(){
	// Get the active composition and selected layers	
	var a = _check_if_layers_are_selected_and_get_them();
	var comp = a.active_composition;
	var layers = a.layers;
	
	// this makes undo cancel all actions performed by this function as a group, so only one click is needed rather than several
	if(!dlg.checkbox_use_inPoint_instead_of_start_time.value) app.beginUndoGroup("Move layers start time to their names")
	else app.beginUndoGroup("Move start time to inPoint time")	
	
	// Loop through each layer
	for (var i = 0; i < layers.length; i++) {		
		var layer = layers[i];	  	  
  
		// change layer start time or inpoint to their names based on the user input
		var layer_name = layer.name;
		
		layer_name = layer_name.split('.')[0]; // after the file is done rendering it comes with an extension, this code ignore it: 00;00;01.MOV -> 00;00;01
		
		if(!dlg.checkbox_use_inPoint_instead_of_start_time.value){ // checks whether to use layer inpoint instead of start time
			layer.startTime = currentFormatToTime(layer_name, comp.frameRate); // The layer name is the time, currentFormatToTime gives the time in the current format, with the appropriate framerate, based on the layer_name
			layer.startTime -= comp.displayStartTime;
		}
		else{
			// the out point changes when the inPoint is set... for some reason. This ensures it won't happen.
			var out_p = layer.outPoint;
			
			layer.inPoint = currentFormatToTime(layer_name, comp.frameRate);
			layer.inPoint -= comp.displayStartTime;
			layer.outPoint = out_p;
		}	   
	}			
	app.endUndoGroup();
}


// move layer name to the layer comments for safekeeping before it gets renamed
function move_layer_names_to_comments(){
	// Get the active composition and selected layers	
	var a = _check_if_layers_are_selected_and_get_them();
	var layers = a.layers;
	
	app.beginUndoGroup("Layer names to comments")
	
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];		
		layer.comment = layer.name;
	}
	app.endUndoGroup();
}

// move layer names back from comments
function move_comments_to_layer_names(){
	// Get the active composition and selected layers	
	var a = _check_if_layers_are_selected_and_get_them();
	var layers = a.layers;
	
	app.beginUndoGroup("Layer comments to names");
	
	for (var i = 0; i < layers.length; i++) {
		var layer = layers[i];	
		layer.name = layer.comment;
	}	
	app.endUndoGroup();
}


// build the gui. See the documentation here for an example. This is almost the same thing.
// Window: https://extendscript.docsforadobe.dev/user-interface-tools/scriptui-programming-model.html#
// Button: https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls.html
var dlg = new Window( "palette", "Change layer names and start time" );
dlg.btnPnl = dlg.add( "panel", undefined, "" );
dlg.btnPnl.layer_names_to_start_time_button = dlg.btnPnl.add( "button", undefined, "Rename layer names to their start time" );
dlg.btnPnl.layer_names_to_start_time_button.onClick = layer_names_to_start_time;
dlg.btnPnl.layer_names_to_start_time_button.helpTip = "Rename layer names to their start times. You might want to move layer names to comments beforehad.";

dlg.btnPnl.start_time_to_layer_names_button = dlg.btnPnl.add( "button", undefined, "Move layers start time to their names" );
dlg.btnPnl.start_time_to_layer_names_button.onClick = start_times_to_layer_names;
dlg.btnPnl.start_time_to_layer_names_button.helpTip = "Move layer start times to their names. Use it after changing layer names to their start time.";

dlg.btnPnl.layer_names_to_comments_button = dlg.btnPnl.add( "button", undefined, "Layer names to comments" );
dlg.btnPnl.layer_names_to_comments_button.onClick = move_layer_names_to_comments;
dlg.btnPnl.layer_names_to_comments_button.helpTip = "Rename the layer names to the layer comments. Use it to backup the layer names before changing them to their start time.";

dlg.btnPnl.layer_comments_to_names_button = dlg.btnPnl.add( "button", undefined, "Layer comments to names" );
dlg.btnPnl.layer_comments_to_names_button.onClick = move_comments_to_layer_names;
dlg.btnPnl.layer_comments_to_names_button.helpTip = "Rename the layer names back from the layer comments.";



// Add a checkbox that decides whether to use a layer start time instead of its inPoint
dlg.checkbox_use_inPoint_instead_of_start_time = dlg.add( "checkbox", undefined, "Use layer inPoint instead of layer start time");
dlg.checkbox_use_inPoint_instead_of_start_time.value = false;
dlg.checkbox_use_inPoint_instead_of_start_time.helpTip = "Rather than renaming layers to their start time, rename them to their inPoint. Same for all other buttons.";

dlg.show();
