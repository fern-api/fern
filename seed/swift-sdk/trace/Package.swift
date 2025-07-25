// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Trace",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Trace",
            targets: ["TraceTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "TraceTarget",
            path: "Sources"
        )
    ]
)
