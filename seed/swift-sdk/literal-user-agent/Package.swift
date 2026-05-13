// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "LiteralUserAgent",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "LiteralUserAgent",
            targets: ["LiteralUserAgent"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "LiteralUserAgent",
            path: "Sources"
        ),
        .testTarget(
            name: "LiteralUserAgentTests",
            dependencies: ["LiteralUserAgent"],
            path: "Tests"
        )
    ]
)
