# Homebrew formula template for helson-lin/homebrew-tap
# CI updates version / url / sha256 on each v*.*.* tag release.
class Hui < Formula
  desc "徽 — Markdown to PNG / PDF / HTML with multi-theme support"
  homepage "https://github.com/helson-lin/hui"
  version "v1.0.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/helson-lin/hui/releases/download/v1.0.0/hui-v1.0.0-darwin-arm64.tar.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    else
      url "https://github.com/helson-lin/hui/releases/download/v1.0.0/hui-v1.0.0-darwin-amd64.tar.gz"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
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
    (testpath/"sample.md").write("# hello\n\nfrom **hui**\n")
    system "#{bin}/hui", "convert", "sample.md", "-f", "html", "-o", "sample.html"
    assert_predicate testpath/"sample.html", :exist?
  end
end
