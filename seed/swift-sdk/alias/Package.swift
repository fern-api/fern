// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Alias",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Alias",
            targets: ["Alias"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Alias",
            path: "Sources"
        )
    ]
)
