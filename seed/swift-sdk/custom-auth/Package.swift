// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "CustomAuth",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "CustomAuth",
            targets: ["CustomAuthTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CustomAuthTarget",
            path: "Sources"
        )
    ]
)
