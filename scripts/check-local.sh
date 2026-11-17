#!/usr/bin/env bash
set -euo pipefail
repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"
npm --prefix frontend test -- --reporter=dot
npm --prefix frontend run build
npm --prefix frontend run build:brochure
python3 scripts/package-brochure.py
(
  cd backend
  ./vendor/bin/sail artisan test
)
git diff --check
for document in kozos-weboldal-folyamat-naplo.md kozos-weboldal-lepesrol-lepesre.html; do
  if [[ -f "../$document" ]]; then
    cmp "docs/$document" "../$document"
  fi
done
printf '%s\n' 'Helyi ellenőrzések sikeresek. Ez nem jelent élesítési jóváhagyást.'
