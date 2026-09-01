#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORKSPACE="$ROOT/ios/App/App.xcworkspace"
SCHEME="App"
ARCHIVE_PATH="${RUNNER_TEMP:-/tmp}/App.xcarchive"
EXPORT_PATH="$ROOT/dist"
EXPORT_OPTIONS="$ROOT/buildTools/ios/ExportOptions.plist"

TEAM_ID="${IOS_DEVELOPMENT_TEAM:?Set IOS_DEVELOPMENT_TEAM}"
PROFILE_NAME="${IOS_PROVISIONING_PROFILE_NAME:?Set IOS_PROVISIONING_PROFILE_NAME}"
SIGN_IDENTITY="${IOS_CODE_SIGN_IDENTITY:-Apple Development}"

mkdir -p "$EXPORT_PATH"

echo "Archiving iOS app..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration Release \
  -archivePath "$ARCHIVE_PATH" \
  archive \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CODE_SIGN_IDENTITY="$SIGN_IDENTITY" \
  PROVISIONING_PROFILE_SPECIFIER="$PROFILE_NAME" \
  | xcpretty || true

if [ ! -d "$ARCHIVE_PATH" ]; then
  echo "Archive failed — retrying xcodebuild without xcpretty for logs"
  xcodebuild \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -configuration Release \
    -archivePath "$ARCHIVE_PATH" \
    archive \
    CODE_SIGN_STYLE=Manual \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    CODE_SIGN_IDENTITY="$SIGN_IDENTITY" \
    PROVISIONING_PROFILE_SPECIFIER="$PROFILE_NAME"
fi

echo "Exporting IPA..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS"

ls -lh "$EXPORT_PATH"
