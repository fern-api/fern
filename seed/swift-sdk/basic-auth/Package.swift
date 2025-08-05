// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "BasicAuth",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "BasicAuth",
            targets: ["BasicAuth"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BasicAuth",
            path: "Sources"
        )
    ]
)
