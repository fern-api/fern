// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "PublicObject",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PublicObject",
            targets: ["PublicObject"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PublicObject",
            path: "Sources"
        )
    ]
)
