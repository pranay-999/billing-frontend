#!/usr/bin/env python3
"""
snapshot_generator_frontend.py
--------------------------------
Generates a single snapshot of the entire frontend repo
including all source files and package dependencies.
"""
import os, json, hashlib, zipfile, subprocess
from datetime import datetime
from pathlib import Path

OUTPUT_JSON = "frontend_snapshot.json"
OUTPUT_ZIP = "frontend_snapshot.zip"
HISTORY_FILE = "snapshot_history.json"
HISTORY_LIMIT = 5
INCLUDE_EXTS = {".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".md"}
EXCLUDE_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".venv", "__pycache__"}

def sha256(data): return hashlib.sha256(data).hexdigest()
def is_excluded(p): return any(part in EXCLUDE_DIRS for part in p.parts)

def collect_files(base="."):
    base = Path(base)
    out = {}
    for path in base.rglob("*"):
        if path.is_file() and not is_excluded(path) and path.suffix in INCLUDE_EXTS:
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
                out[str(path.relative_to(base))] = {
                    "content": text[:200000],
                    "sha256": sha256(text.encode()),
                    "size": len(text),
                }
            except Exception as e:
                out[str(path)] = {"error": str(e)}
    return out

def get_git_commit():
    try: return subprocess.check_output(["git","rev-parse","HEAD"]).decode().strip()
    except: return "unknown"

def get_dependencies():
    pkg = Path("package.json")
    if pkg.exists():
        try:
            data = json.loads(pkg.read_text())
            return data.get("dependencies", {})
        except: return {"error":"Could not read package.json"}
    return {}

def make_zip(snapshot):
    with zipfile.ZipFile(OUTPUT_ZIP,"w",zipfile.ZIP_DEFLATED) as z:
        for path, data in snapshot["files"].items():
            z.writestr(path, data.get("content",""))
    print(f"🗜 Created {OUTPUT_ZIP}")

def update_history(meta):
    hist = []
    if Path(HISTORY_FILE).exists():
        try: hist = json.loads(Path(HISTORY_FILE).read_text())
        except: pass
    hist.insert(0, meta)
    hist = hist[:HISTORY_LIMIT]
    Path(HISTORY_FILE).write_text(json.dumps(hist, indent=2))

def main():
    files = collect_files()
    snapshot = {
        "type": "frontend",
        "generated_at": datetime.utcnow().isoformat()+"Z",
        "git_commit": get_git_commit(),
        "dependencies": get_dependencies(),
        "files": files,
        "meta": {"total_files": len(files)}
    }
    Path(OUTPUT_JSON).write_text(json.dumps(snapshot, indent=2))
    make_zip(snapshot)
    update_history({"timestamp": snapshot["generated_at"], "commit": snapshot["git_commit"], "total_files": len(files)})
    print(f"✅ Snapshot ready: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
