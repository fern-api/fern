// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "HeaderToken",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "HeaderToken",
            targets: ["HeaderToken"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "HeaderToken",
            path: "Sources"
        ),
        .testTarget(
            name: "HeaderTokenTests",
            dependencies: ["HeaderToken"],
            path: "Tests"
        )
    ]
)
