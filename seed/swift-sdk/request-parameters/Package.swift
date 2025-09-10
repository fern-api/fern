// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "RequestParameters",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "RequestParameters",
            targets: ["RequestParameters"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "RequestParameters",
            path: "Sources"
        )
    ]
)
