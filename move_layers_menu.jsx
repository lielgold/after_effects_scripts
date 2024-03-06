// Create a user interface for setting parameters
var win = new Window("palette", "Move Layers");
win.alignChildren = "left";

// set up the movement duration button
var durationGroup = win.add("group");
var durationText = durationGroup.add("statictext", undefined, "Movement duration:");
var durationInput = durationGroup.add("edittext", undefined, "2");

// set up the x-axis movement button
var xGroup = win.add("group");
var xText = xGroup.add("statictext", undefined, "X-axis movement:");
var xInput = xGroup.add("edittext", undefined, "800");

// set up the y-axis movement button
var yGroup = win.add("group");
var yMovementText = yGroup.add("statictext", undefined, "Y-axis movement:");
var yInput = yGroup.add("edittext", undefined, "0");

// set up the minimal random value button
var minimalGroup = win.add("group");
var minimalText = minimalGroup.add("statictext", undefined, "Minimal movement speed value:");
var MinimalInput = minimalGroup.add("edittext", undefined, "25");

// set up the max random value button
var maxGroup = win.add("group");
var maxText = maxGroup.add("statictext", undefined, "Maximal movement speed value:");
var maxInput = maxGroup.add("edittext", undefined, "45");


// set input boxes size
var elements = [durationGroup, xGroup, yGroup, minimalGroup, maxGroup];
for (var i = 0; i < elements.length; i++) {
    elements[i].orientation = "row";
    elements[i].alignChildren = ["left", "center"];
}

// set groups orientation
var elements = [durationInput, xInput, yInput, MinimalInput, maxInput];
for (var i = 0; i < elements.length; i++) {
    elements[i].characters = 5;
}

// approve button
var moveButton = win.add("button", undefined, "Move Layers");
moveButton.onClick = moveLayers;

win.show();


function random_int(min, max) {
    // Generate a random number between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min)) + min;
}

function moveLayers() {    
    // Begin undo group
    app.beginUndoGroup("Move Layers");

    // Retrieve parameter values from the user interface
    var moveX = parseInt(xInput.text);
    var moveY = parseInt(yInput.text);
    var moveDuration = parseFloat(durationInput.text);    
    var minRandom = parseFloat(MinimalInput.text);    
    var maxRandom = parseFloat(maxInput.text);    

    // Loop through selected layers
    var selectedLayers = app.project.activeItem.selectedLayers;
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];

        // Set up keyframes for position property
        var currentPosition = layer.transform.position.value;
        var newPosition = [currentPosition[0] + moveX, currentPosition[1] + moveY];
        
        // Set keyframes at current time
        layer.transform.position.setValueAtTime(app.project.activeItem.time, currentPosition);
        layer.transform.position.setValueAtTime(app.project.activeItem.time + moveDuration, newPosition);
        
        // Set easing for the keyframes
        var randomNumber_1 = random_int(minRandom, maxRandom);
        var randomNumber_2 = random_int(minRandom, maxRandom);
        var easeIn = new KeyframeEase(0.33, randomNumber_1);
        var easeOut = new KeyframeEase(0.33, randomNumber_2);
  
        layer.transform.position.setTemporalEaseAtKey(1, [easeIn], [easeOut]);
        layer.transform.position.setTemporalEaseAtKey(2, [easeIn], [easeOut]);

    }
    app.endUndoGroup();
}
