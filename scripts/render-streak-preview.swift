import AppKit
import Foundation

let size = 180
let outDir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "tmp-icons"
try FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

func render(_ label: String) -> Data {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: size,
        pixelsHigh: size,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    rep.size = NSSize(width: size, height: size)

    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    NSColor.black.setFill()
    NSRect(x: 0, y: 0, width: size, height: size).fill()

    let emojiFont = NSFont(name: "Apple Color Emoji", size: 132)!
    let emoji = NSAttributedString(string: "🔥", attributes: [.font: emojiFont])
    let emojiSize = emoji.size()
    emoji.draw(at: NSPoint(
        x: (CGFloat(size) - emojiSize.width) / 2,
        y: (CGFloat(size) - emojiSize.height) / 2 - 2
    ))

    let numberSize: CGFloat = label.count >= 3 ? 54 : (label.count == 2 ? 68 : 86)
    let numberFont = NSFont(name: "Papyrus", size: numberSize)!
    let outline = NSAttributedString(string: label, attributes: [
        .font: numberFont,
        .foregroundColor: NSColor(srgbRed: 0.18, green: 0.05, blue: 0, alpha: 1),
    ])
    let number = NSAttributedString(string: label, attributes: [
        .font: numberFont,
        .foregroundColor: NSColor.white,
    ])
    let numberSizeBox = number.size()
    let origin = NSPoint(
        x: (CGFloat(size) - numberSizeBox.width) / 2,
        y: (CGFloat(size) - numberSizeBox.height) / 2 - 22
    )
    for dx in stride(from: -2.5, through: 2.5, by: 1.25) {
        for dy in stride(from: -2.5, through: 2.5, by: 1.25) {
            outline.draw(at: NSPoint(x: origin.x + dx, y: origin.y + dy))
        }
    }
    number.draw(at: origin)

    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])!
}

let labels = CommandLine.arguments.count > 2
    ? Array(CommandLine.arguments.dropFirst(2))
    : (0...999).map(String.init)

for label in labels {
    let data = render(label)
    let path = (outDir as NSString).appendingPathComponent("\(label).png")
    try data.write(to: URL(fileURLWithPath: path))
}
print("\(labels.count) icons -> \(outDir)")
