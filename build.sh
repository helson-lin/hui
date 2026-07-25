#!/usr/bin/env bash
# Build multi-platform release binaries + tar.gz for GitHub Release / Homebrew.
# Usage: bash build.sh [vX.Y.Z]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  if [[ -n "${GITHUB_REF:-}" && "$GITHUB_REF" == refs/tags/* ]]; then
    TAG="${GITHUB_REF#refs/tags/}"
  else
    TAG="v$(node -p "require('./package.json').version")"
  fi
fi

# strip leading v for package version inject; keep TAG with v for artifact names
VERSION="${TAG#v}"
export HUI_VERSION="$VERSION"

echo "==> Building hui ${TAG} (version ${VERSION})"

rm -rf release
mkdir -p release

echo "==> npm ci / install"
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "==> TypeScript compile"
npm run build

echo "==> Bundle CLI (esbuild → dist/bundle.cjs)"
node scripts/bundle.mjs

# pkg targets: node20 + os + arch
# Artifact naming mirrors doke: hui-<tag>-darwin-arm64.tar.gz
declare -a TARGETS=(
  "node20-macos-arm64|darwin-arm64|hui"
  "node20-macos-x64|darwin-amd64|hui"
  "node20-linux-x64|linux-amd64|hui"
  "node20-linux-arm64|linux-arm64|hui"
  "node20-win-x64|windows-amd64|hui.exe"
)

echo "==> Packaging binaries with @yao-pkg/pkg"
for entry in "${TARGETS[@]}"; do
  IFS='|' read -r pkg_target platform bin_name <<<"$entry"
  out_dir="release/staging-${platform}"
  rm -rf "$out_dir"
  mkdir -p "$out_dir"

  echo "  → ${platform} (${pkg_target})"
  npx --yes @yao-pkg/pkg@5.16.1 dist/bundle.cjs \
    --config package.json \
    --targets "$pkg_target" \
    --output "$out_dir/${bin_name}" \
    --compress GZip

  archive="release/hui-${TAG}-${platform}"
  if [[ "$platform" == windows-* ]]; then
    (
      cd "$out_dir"
      if command -v zip >/dev/null 2>&1; then
        zip -q "../hui-${TAG}-${platform}.zip" "$bin_name"
      else
        tar -czf "../hui-${TAG}-${platform}.tar.gz" "$bin_name"
      fi
    )
  else
    tar -czf "${archive}.tar.gz" -C "$out_dir" "$bin_name"
  fi

  rm -rf "$out_dir"
done

echo "==> Checksums"
(
  cd release
  shopt -s nullglob
  files=(hui-${TAG}-*.tar.gz hui-${TAG}-*.zip)
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "${files[@]}" > SHA256SUMS
  else
    shasum -a 256 "${files[@]}" > SHA256SUMS
  fi
)

echo "==> Release artifacts"
ls -lh release/

echo "$TAG" > release/TAG
echo "$VERSION" > release/VERSION

echo "Done. Artifacts in release/"
