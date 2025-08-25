// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "WebsocketAuth",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "WebsocketAuth",
            targets: ["WebsocketAuth"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "WebsocketAuth",
            path: "Sources"
        )
    ]
)
