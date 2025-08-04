// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "AnyAuth",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "AnyAuth",
            targets: ["AnyAuth"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AnyAuth",
            path: "Sources"
        )
    ]
)
