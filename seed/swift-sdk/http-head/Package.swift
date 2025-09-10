// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "HttpHead",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "HttpHead",
            targets: ["HttpHead"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "HttpHead",
            path: "Sources"
        )
    ]
)
