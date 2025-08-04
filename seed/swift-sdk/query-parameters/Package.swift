// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "QueryParameters",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "QueryParameters",
            targets: ["QueryParameters"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "QueryParameters",
            path: "Sources"
        )
    ]
)
