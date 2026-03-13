// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Webhooks",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Webhooks",
            targets: ["Webhooks"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Webhooks",
            path: "Sources"
        ),
        .testTarget(
            name: "WebhooksTests",
            dependencies: ["Webhooks"],
            path: "Tests"
        )
    ]
)
