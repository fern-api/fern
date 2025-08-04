// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "License",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "License",
            targets: ["License"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "License",
            path: "Sources"
        )
    ]
)
