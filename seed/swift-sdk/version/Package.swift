// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Version",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Version",
            targets: ["Version"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Version",
            path: "Sources"
        )
    ]
)
