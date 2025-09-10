// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "IdempotencyHeaders",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "IdempotencyHeaders",
            targets: ["IdempotencyHeaders"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "IdempotencyHeaders",
            path: "Sources"
        )
    ]
)
