// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "HeaderTokenEnvironmentVariable",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "HeaderTokenEnvironmentVariable",
            targets: ["HeaderTokenEnvironmentVariable"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "HeaderTokenEnvironmentVariable",
            path: "Sources"
        ),
        .testTarget(
            name: "HeaderTokenEnvironmentVariableTests",
            dependencies: ["HeaderTokenEnvironmentVariable"],
            path: "Tests"
        )
    ]
)
