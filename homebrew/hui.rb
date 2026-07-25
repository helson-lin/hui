# Homebrew formula for helson-lin/homebrew-tap
# MUST live at tap root as hui.rb only (same as doke.rb / of.rb).
# Do NOT also put under Formula/ — duplicate class breaks brew discovery.
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
  end

  def caveats
    <<~EOS
      HTML export works out of the box.

      PNG / PDF need Google Chrome or Chromium installed on the system.
      Optional override:
        export HUI_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    EOS
  end

  test do
    system "#{bin}/hui", "--version"
  end
end
