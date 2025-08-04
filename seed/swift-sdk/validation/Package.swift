// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Validation",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Validation",
            targets: ["Validation"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Validation",
            path: "Sources"
        )
    ]
)
