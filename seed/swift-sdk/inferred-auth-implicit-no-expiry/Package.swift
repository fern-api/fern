// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "InferredAuthImplicitNoExpiry",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "InferredAuthImplicitNoExpiry",
            targets: ["InferredAuthImplicitNoExpiry"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "InferredAuthImplicitNoExpiry",
            path: "Sources"
        )
    ]
)
