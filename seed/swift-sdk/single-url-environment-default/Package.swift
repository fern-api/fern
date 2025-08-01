// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "SingleUrlEnvironmentDefault",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "SingleUrlEnvironmentDefault",
            targets: ["SingleUrlEnvironmentDefault"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "SingleUrlEnvironmentDefault",
            path: "Sources"
        )
    ]
)
