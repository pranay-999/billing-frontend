#!/usr/bin/env python3
import os, json, hashlib, zipfile
from datetime import datetime
from pathlib import Path

OUTPUT_JSON = "frontend_snapshot.json"
INCLUDE_EXTS = {".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json", ".md"}
EXCLUDE_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".venv", "__pycache__"}

def sha256(data): return hashlib.sha256(data).hexdigest()
def is_excluded(p): return any(part in EXCLUDE_DIRS for part in p.parts)

def collect_files(base="."):
    base = Path(base)
    out = {}
    for path in base.rglob("*"):
        if path.is_file() and not is_excluded(path) and path.suffix in INCLUDE_EXTS:
            text = path.read_text(encoding="utf-8", errors="ignore")
            out[str(path.relative_to(base))] = {
                "content": text[:200000],
                "sha256": sha256(text.encode()),
                "size": len(text),
            }
    return out

def main():
    files = collect_files()
    snapshot = {
        "type": "frontend",
        "generated_at": datetime.utcnow().isoformat()+"Z",
        "files": files,
        "meta": {"total_files": len(files)}
    }
    Path(OUTPUT_JSON).write_text(json.dumps(snapshot, indent=2))
    print(f"✅ Frontend snapshot created with {len(files)} files")

if __name__ == "__main__":
    main()
