// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ServerSentEvents",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ServerSentEvents",
            targets: ["ServerSentEvents"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ServerSentEvents",
            path: "Sources"
        )
    ]
)
