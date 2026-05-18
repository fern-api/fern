// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ServerSentEventsResumable",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ServerSentEventsResumable",
            targets: ["ServerSentEventsResumable"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ServerSentEventsResumable",
            path: "Sources"
        ),
        .testTarget(
            name: "ServerSentEventsResumableTests",
            dependencies: ["ServerSentEventsResumable"],
            path: "Tests"
        )
    ]
)
