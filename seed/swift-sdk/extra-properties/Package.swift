// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ExtraProperties",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ExtraProperties",
            targets: ["ExtraProperties"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ExtraProperties",
            path: "Sources"
        )
    ]
)
