// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "PlainText",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PlainText",
            targets: ["PlainTextTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PlainTextTarget",
            path: "Sources"
        )
    ]
)
