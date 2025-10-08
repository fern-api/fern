// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Unions",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Unions",
            targets: ["Unions"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Unions",
            path: "Sources"
        ),
        .testTarget(
            name: "UnionsTests",
            dependencies: ["Unions"],
            path: "Tests"
        )
    ]
)
