#!/usr/bin/env bash
set -euo pipefail

# Run from the vendor/ directory. This creates the native Android project only
# when it is missing, installs this variant's Firebase config, then syncs web assets/plugins.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -d android ]]; then
  npx cap add android
fi

mkdir -p android/app
cp firebase/google-services.json android/app/google-services.json
npm run build
npx cap sync android

# Capacitor's Android template may not enable the Google Services Gradle plugin by default.
# Add the plugin classpath/application only when absent, preserving existing project files.
ROOT_GRADLE="android/build.gradle"
APP_GRADLE="android/app/build.gradle"
if [[ -f "$ROOT_GRADLE" ]] && ! grep -q "com.google.gms:google-services" "$ROOT_GRADLE"; then
  python3 - "$ROOT_GRADLE" <<'PYEDIT'
from pathlib import Path
import sys
p=Path(sys.argv[1]); s=p.read_text()
needle="dependencies {"
if needle not in s:
    raise SystemExit("Could not safely find dependencies block in android/build.gradle; add Google Services plugin classpath manually.")
s=s.replace(needle, needle + "\n        classpath 'com.google.gms:google-services:4.4.2'", 1)
p.write_text(s)
PYEDIT
fi
if [[ -f "$APP_GRADLE" ]] && ! grep -q "com.google.gms.google-services" "$APP_GRADLE"; then
  cat >> "$APP_GRADLE" <<'GRADLEPLUGIN'

// Firebase Google Services plugin for vendor FCM
apply plugin: 'com.google.gms.google-services'
GRADLEPLUGIN
fi

echo
echo "Prepared Fidelx Vendor Android project. Package ID must remain com.fidelx.vendor."
echo "Next: open android/ in Android Studio, allow Gradle sync, then build/install on a test device."
