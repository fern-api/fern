// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "NullableOptional",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "NullableOptional",
            targets: ["NullableOptional"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NullableOptional",
            path: "Sources"
        ),
        .testTarget(
            name: "NullableOptionalTests",
            dependencies: ["NullableOptional"],
            path: "Tests"
        )
    ]
)
