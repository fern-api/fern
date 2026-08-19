// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Errors",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Errors",
            targets: ["Errors"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Errors",
            path: "Sources"
        ),
        .testTarget(
            name: "ErrorsTests",
            dependencies: ["Errors"],
            path: "Tests"
        )
    ]
)
