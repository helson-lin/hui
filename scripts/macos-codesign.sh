#!/usr/bin/env bash
# Ad-hoc codesign a pkg binary for Apple Silicon.
# Without a valid signature, macOS SIGKILLs arm64 executables ("zsh: killed").
#
# Prefer plain ad-hoc signing (no hardened runtime). Hardened runtime without
# Developer ID notarization is stricter and can still kill Node/V8 binaries.
set -euo pipefail

BIN="${1:?usage: macos-codesign.sh <binary>}"
IDENT="${CODESIGN_IDENTIFIER:-com.helsonlin.hui}"

if [[ ! -f "$BIN" ]]; then
  echo "error: binary not found: $BIN" >&2
  exit 1
fi

if ! command -v codesign >/dev/null 2>&1; then
  echo "error: codesign not available (must run on macOS)" >&2
  exit 1
fi

# Clear quarantine / resource forks that break codesign or Gatekeeper
if command -v xattr >/dev/null 2>&1; then
  xattr -cr "$BIN" 2>/dev/null || true
fi

# Drop any invalid/partial signature left by the pkg base Node image
codesign --remove-signature "$BIN" 2>/dev/null || true

echo "codesign (ad-hoc) → $BIN"
codesign --force --sign - --identifier "$IDENT" --timestamp=none "$BIN"
codesign --verify --verbose=2 "$BIN"
echo "codesign OK: $BIN"
