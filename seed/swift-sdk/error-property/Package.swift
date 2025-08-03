// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ErrorProperty",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ErrorProperty",
            targets: ["ErrorProperty"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ErrorProperty",
            path: "Sources"
        )
    ]
)
