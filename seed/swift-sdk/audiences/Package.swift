// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Audiences",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Audiences",
            targets: ["Audiences"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Audiences",
            path: "Sources"
        )
    ]
)
