// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "InferredAuthExplicit",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "InferredAuthExplicit",
            targets: ["InferredAuthExplicit"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "InferredAuthExplicit",
            path: "Sources"
        )
    ]
)
