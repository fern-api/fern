// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "NoRetries",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "NoRetries",
            targets: ["NoRetries"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NoRetries",
            path: "Sources"
        ),
        .testTarget(
            name: "NoRetriesTests",
            dependencies: ["NoRetries"],
            path: "Tests"
        )
    ]
)
