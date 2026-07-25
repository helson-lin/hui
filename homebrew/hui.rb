# Homebrew formula for helson-lin/homebrew-tap (root: hui.rb only, like doke/of)
# CI updates version / url / sha256 on each v*.*.* tag release.
class Hui < Formula
  desc "Markdown to PNG/PDF/HTML converter with multi-theme support"
  homepage "https://github.com/helson-lin/hui"
  version "v1.0.0"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/helson-lin/hui/releases/download/v1.0.0/hui-v1.0.0-darwin-arm64.tar.gz"
      sha256 "5f6099e74741da8372587003fea9482108643c2e8d5c054d09ad66626abf2907"
    else
      url "https://github.com/helson-lin/hui/releases/download/v1.0.0/hui-v1.0.0-darwin-amd64.tar.gz"
      sha256 "a85d94435beb57478038f8f8f90ca1a7b182b23afe02e85a0ad05f884ea37eef"
    end
  end

  def install
    bin.install "hui"
    # pkg binaries built on Linux lack a valid macOS code signature.
    # Unsigned arm64 executables are SIGKILL'd by the kernel (zsh: killed).
    return unless OS.mac?

    system "xattr", "-cr", bin/"hui"
    system "codesign", "--force", "--sign", "-", bin/"hui"
  end

  def caveats
    <<~EOS
      HTML export works out of the box.

      PNG / PDF need Google Chrome or Chromium installed on the system.
      Optional override:
        export HUI_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

      If you still see "zsh: killed", re-sign the binary:
        codesign --force --sign - "$(brew --prefix)/bin/hui"
        xattr -cr "$(brew --prefix)/bin/hui"
    EOS
  end

  test do
    system "#{bin}/hui", "--version"
  end
end
