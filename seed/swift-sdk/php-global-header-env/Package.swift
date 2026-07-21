// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "PhpGlobalHeaderEnv",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PhpGlobalHeaderEnv",
            targets: ["PhpGlobalHeaderEnv"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PhpGlobalHeaderEnv",
            path: "Sources"
        ),
        .testTarget(
            name: "PhpGlobalHeaderEnvTests",
            dependencies: ["PhpGlobalHeaderEnv"],
            path: "Tests"
        )
    ]
)
