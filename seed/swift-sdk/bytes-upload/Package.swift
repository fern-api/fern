// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "BytesUpload",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "BytesUpload",
            targets: ["BytesUpload"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BytesUpload",
            path: "Sources"
        )
    ]
)
