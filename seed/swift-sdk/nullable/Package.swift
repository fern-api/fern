// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "NullableApi",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "NullableApi",
            targets: ["NullableApi"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NullableApi",
            path: "Sources"
        ),
        .testTarget(
            name: "NullableApiTests",
            dependencies: ["NullableApi"],
            path: "Tests"
        )
    ]
)
