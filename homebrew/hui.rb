# Homebrew formula for helson-lin/homebrew-tap (root: hui.rb only, like doke/of)
# CI updates version / url / sha256 on each v*.*.* tag release.
class Hui < Formula
  desc "Markdown to PNG/PDF/HTML converter with multi-theme support"
  homepage "https://github.com/helson-lin/hui"
  version "1.0.2"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/helson-lin/hui/releases/download/v1.0.2/hui-v1.0.2-darwin-arm64.tar.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    else
      url "https://github.com/helson-lin/hui/releases/download/v1.0.2/hui-v1.0.2-darwin-amd64.tar.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    end
  end

  def install
    bin.install "hui"

    # pkg/darwin binaries must carry a valid code signature on Apple Silicon.
    # Unsigned arm64 executables are SIGKILL'd by the kernel (zsh: killed).
    # Always re-sign after install so brew download/quarantine cannot leave a
    # broken or missing signature.
    return unless OS.mac?

    bin_path = bin/"hui"
    system "/usr/bin/xattr", "-cr", bin_path
    # Best-effort: drop any partial signature from the shipped binary
    quiet_system "/usr/bin/codesign", "--remove-signature", bin_path

    system "/usr/bin/codesign",
           "--force",
           "--sign", "-",
           "--identifier", "com.helsonlin.hui",
           "--timestamp=none",
           bin_path
    system "/usr/bin/codesign", "--verify", "--verbose", bin_path
    # Fail install early if the kernel would still SIGKILL the binary.
    system bin_path, "--version"
  end

  def caveats
    <<~EOS
      HTML export works out of the box.

      PNG / PDF need Google Chrome or Chromium installed on the system.
      Optional override:
        export HUI_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

      If you still see "zsh: killed", re-sign and clear quarantine:
        xattr -cr "$(brew --prefix)/bin/hui"
        codesign --force --sign - --timestamp=none \\
          --identifier com.helsonlin.hui "$(brew --prefix)/bin/hui"
        hui --version
    EOS
  end

  test do
    assert_match(/\d+\.\d+\.\d+/, shell_output("#{bin}/hui --version"))
  end
end
