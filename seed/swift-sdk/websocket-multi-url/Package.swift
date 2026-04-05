// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "WebsocketMultiUrl",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "WebsocketMultiUrl",
            targets: ["WebsocketMultiUrl"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "WebsocketMultiUrl",
            path: "Sources"
        ),
        .testTarget(
            name: "WebsocketMultiUrlTests",
            dependencies: ["WebsocketMultiUrl"],
            path: "Tests"
        )
    ]
)
