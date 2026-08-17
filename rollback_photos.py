import os
import shutil
import json

backup_dir = "_backup_photos"
manifest_path = os.path.join(backup_dir, "manifest.json")

if not os.path.exists(manifest_path):
    print("No backup manifest found. Nothing to rollback.")
    exit(1)

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

# Restore galleryData.js
gallery_backup = os.path.join(backup_dir, "galleryData.js")
if os.path.exists(gallery_backup):
    shutil.copy2(gallery_backup, "galleryData.js")
    print("Restored: galleryData.js")

# Restore images
for item in manifest.get("backups", []):
    if os.path.exists(item["backup"]):
        shutil.copy2(item["backup"], item["original"])
        print(f"Restored: {item['original']}")

print("\nRollback completed successfully! Everything has been restored to pre-update state.")
