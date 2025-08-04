// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Exhaustive",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Exhaustive",
            targets: ["Exhaustive"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Exhaustive",
            path: "Sources"
        )
    ]
)
