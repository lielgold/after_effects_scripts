These are a bunch of After Effects 2024 scripts I wrote.

# move_layers_ae:

Move layers together at a specific direction. Each layer moves at a different random speed.
  1. Select the layers you want to move.
  2. Select movement duration, direction, and minimal and maximal movement speed.
  3. Press "move layers".

https://github.com/lielgold/after_effects_scripts/assets/139998350/99e714de-5033-4613-85bd-17c1955a3b16

# change_layer_names_to_start_time_and_vice_versa:

Undo changes to layers inPoint / start time. This was used in the transition from offline to online editing, when the layers' inPoints would sometime change unexpectedly.
To do this, first update the layer names to reflect their respective inPoints. To undo their movements, synchronize the inPoints with their new names. 

How to use it:

1. Select the layers you want to change.
2. Press the checkmark at the bottom - "Use layer inPoint instead of layer start time". 
3. Press "rename layer names to their start time".
4. Move the layers in the timeline window.
5. Press "move layers start time to their name" to bring them back to their original inPoints.

You can also use the layer's notes field instead of the layer name, if you care to preserve the original name.

# export_import_images.jsx
# make_clean_psd_from_clean_image.jsx

Use these scripts to round-trip images between After Effects and Photoshop. This process replaces an image in your AE composition with a PSD file while retaining all existing layer properties (Scale, Position, Effects, etc.). Once linked, any saved changes in Photoshop will automatically update within After Effects.
1. In After Effects: Run export_import_images.jsx. Select the target image layers and click Export. This creates a copy of the source file with a _clean suffix.
2. In Photoshop: Run make_clean_psd_from_clean_image.jsx and select the _clean file. The script will generate a new PSD file with the same name.
3. Back in After Effects: Use the export_import_images.jsx script to Import the PSD file created in Step 2. The temporary _clean file will be deleted automatically.


