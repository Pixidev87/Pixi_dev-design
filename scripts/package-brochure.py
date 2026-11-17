#!/usr/bin/env python3
"""Package the already-built brochure, never application sources or credentials."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import re

root = Path(__file__).resolve().parents[1]
build = root / "frontend/dist-brochure"
output = root / "artifacts"
if not (build / "index.html").is_file():
    raise SystemExit("First run: npm --prefix frontend run build:brochure")
files = sorted(path for path in build.rglob("*") if path.is_file())
allowed = {".html", ".js", ".css", ".png", ".jpg", ".jpeg", ".svg", ".webp", ".ico", ".woff", ".woff2", ".txt"}
for path in files:
    relative = path.relative_to(build)
    if path.is_symlink() or any(part.startswith(".") for part in relative.parts) or path.suffix not in allowed:
        raise SystemExit("Unexpected build file; archive not created.")
    if path.suffix in {".html", ".js", ".css"}:
        content = path.read_text()
        if re.search(r"sk-ant-|/api/v1|Authorization|ANTHROPIC_API_KEY", content):
            raise SystemExit("API/client credential marker found; archive not created.")
output.mkdir(exist_ok=True)
archive = output / "pixidevdesign-nethely-bemutato.zip"
with ZipFile(archive, "w", ZIP_DEFLATED) as bundle:
    for path in files:
        bundle.write(path, path.relative_to(build))
    bundle.write(root / "deployment/nethely/brochure.htaccess", ".htaccess")
checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
(output / (archive.name + ".sha256")).write_text(checksum + "  " + archive.name + "\n")
print(f"Created {archive} ({archive.stat().st_size} bytes); SHA256 {checksum}")
