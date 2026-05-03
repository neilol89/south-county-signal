#!/usr/bin/env python3
"""Deploy site/ folder to Netlify via API.

Reads NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID from the environment (or .env).
Create a token at https://app.netlify.com/user/applications#personal-access-tokens
"""
import os, hashlib, sys, requests

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN")
SITE_ID = os.environ.get("NETLIFY_SITE_ID")

if not TOKEN or not SITE_ID:
    print("ERROR: NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID must be set.", file=sys.stderr)
    print("Add them to .env (already gitignored) — see scripts/deploy-netlify.py for details.", file=sys.stderr)
    sys.exit(1)

SITE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")

headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

# Build file hash manifest
files = {}
for root, dirs, filenames in os.walk(SITE_DIR):
    for f in filenames:
        full = os.path.join(root, f)
        rel = "/" + os.path.relpath(full, SITE_DIR).replace(os.sep, "/")
        sha1 = hashlib.sha1(open(full, "rb").read()).hexdigest()
        files[rel] = sha1

print(f"Files to deploy: {len(files)}")
for k in files:
    print(f"  {k}")

# Create deploy
resp = requests.post(
    f"https://api.netlify.com/api/v1/sites/{SITE_ID}/deploys",
    headers=headers,
    json={"files": files}
)
deploy = resp.json()
deploy_id = deploy["id"]
required = deploy.get("required", [])
print(f"Deploy ID: {deploy_id}")
print(f"Files to upload: {len(required)}")

# Upload required files
upload_headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/octet-stream"}
sha_to_path = {v: k for k, v in files.items()}

for sha in required:
    rel_path = sha_to_path[sha]
    full_path = os.path.join(SITE_DIR, rel_path.lstrip("/"))
    with open(full_path, "rb") as f:
        data = f.read()
    r = requests.put(
        f"https://api.netlify.com/api/v1/deploys/{deploy_id}/files{rel_path}",
        headers=upload_headers,
        data=data
    )
    print(f"  Uploaded {rel_path}: {r.status_code}")

print("Deploy complete!")
