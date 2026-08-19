// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "InferredAuthImplicitApiKey",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "InferredAuthImplicitApiKey",
            targets: ["InferredAuthImplicitApiKey"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "InferredAuthImplicitApiKey",
            path: "Sources"
        ),
        .testTarget(
            name: "InferredAuthImplicitApiKeyTests",
            dependencies: ["InferredAuthImplicitApiKey"],
            path: "Tests"
        )
    ]
)
