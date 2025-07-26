// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Websocket",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Websocket",
            targets: ["WebsocketTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "WebsocketTarget",
            path: "Sources"
        )
    ]
)
