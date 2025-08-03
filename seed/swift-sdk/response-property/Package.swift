// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ResponseProperty",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ResponseProperty",
            targets: ["ResponseProperty"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ResponseProperty",
            path: "Sources"
        )
    ]
)
