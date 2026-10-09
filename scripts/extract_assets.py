#!/usr/bin/env python3
import os
import sys
import zipfile
import json
import hashlib
import shutil

ASSET_IMPORT_DIR = 'asset-import'
PUBLIC_ASSETS_DIR = 'public/assets'
MANIFEST_FILE = os.path.join(PUBLIC_ASSETS_DIR, '.manifest.json')

ZIP_MAP = {
    'maximo model.zip': os.path.join(PUBLIC_ASSETS_DIR, 'characters'),
    'kenney_city-kit-suburban_20.zip': os.path.join(PUBLIC_ASSETS_DIR, 'kenney', 'city'),
    'kenney_car-kit.zip': os.path.join(PUBLIC_ASSETS_DIR, 'kenney', 'cars'),
    'kenney_furniture-kit.zip': os.path.join(PUBLIC_ASSETS_DIR, 'kenney', 'furniture'),
    'kenney_nature-kit.zip': os.path.join(PUBLIC_ASSETS_DIR, 'kenney', 'nature'),
}

KEEP_EXTS = {'.glb', '.gltf', '.fbx', '.png', '.jpg', '.jpeg'}

def compute_file_hash(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read(65536)
        while len(buf) > 0:
            hasher.update(buf)
            buf = f.read(65536)
    return hasher.hexdigest()

def load_manifest():
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_manifest(manifest):
    os.makedirs(PUBLIC_ASSETS_DIR, exist_ok=True)
    with open(MANIFEST_FILE, 'w') as f:
        json.dump(manifest, f, indent=2)

def extract_and_clean():
    if not os.path.exists(ASSET_IMPORT_DIR):
        print(f"Directory {ASSET_IMPORT_DIR} does not exist. Skipping asset extraction.")
        return

    os.makedirs(PUBLIC_ASSETS_DIR, exist_ok=True)
    manifest = load_manifest()
    updated = False

    for zip_name, target_dir in ZIP_MAP.items():
        zip_path = os.path.join(ASSET_IMPORT_DIR, zip_name)
        if not os.path.exists(zip_path):
            print(f"Warning: Zip file {zip_path} not found.")
            continue

        print(f"Inspecting {zip_name}...")
        file_hash = compute_file_hash(zip_path)

        if manifest.get(zip_name) == file_hash and os.path.exists(target_dir):
            print(f"Archive {zip_name} already extracted and up-to-date.")
            continue

        try:
            with zipfile.ZipFile(zip_path, 'r') as z:
                # Test archive integrity
                bad_file = z.testzip()
                if bad_file:
                    print(f"Error: Corrupt file detected in {zip_name}: {bad_file}")
                    continue

                os.makedirs(target_dir, exist_ok=True)
                print(f"Extracting {zip_name} to {target_dir}...")

                for member in z.infolist():
                    # Security check: prevent directory traversal
                    resolved_path = os.path.abspath(os.path.join(target_dir, member.filename))
                    if not resolved_path.startswith(os.path.abspath(target_dir)):
                        print(f"Unsafe path detected in {zip_name}: {member.filename}")
                        continue

                    ext = os.path.splitext(member.filename)[1].lower()
                    # Skip unneeded formats and previews
                    if 'Isometric' in member.filename or 'DAE format' in member.filename or 'OBJ format' in member.filename or 'STL format' in member.filename or 'Previews' in member.filename or 'FBX format' in member.filename and 'kenney' in target_dir:
                        continue

                    if ext in KEEP_EXTS or member.is_dir():
                        z.extract(member, target_dir)

            manifest[zip_name] = file_hash
            updated = True
            print(f"Successfully processed {zip_name}.")

        except zipfile.BadZipFile:
            print(f"Error: {zip_name} is not a valid zip file.")
        except Exception as e:
            print(f"Error processing {zip_name}: {e}")

    if updated:
        save_manifest(manifest)
        print("Asset manifest updated.")

if __name__ == '__main__':
    extract_and_clean()
