// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "FileDownload",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "FileDownload",
            targets: ["FileDownload"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "FileDownload",
            path: "Sources"
        )
    ]
)
