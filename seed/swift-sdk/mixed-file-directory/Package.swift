// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "MixedFileDirectory",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "MixedFileDirectory",
            targets: ["MixedFileDirectory"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MixedFileDirectory",
            path: "Sources"
        )
    ]
)
