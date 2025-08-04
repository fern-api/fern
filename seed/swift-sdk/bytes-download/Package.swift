// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "BytesDownload",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "BytesDownload",
            targets: ["BytesDownload"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BytesDownload",
            path: "Sources"
        )
    ]
)
