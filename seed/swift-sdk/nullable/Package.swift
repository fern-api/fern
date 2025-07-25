// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Nullable",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Nullable",
            targets: ["NullableTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NullableTarget",
            path: "Sources"
        )
    ]
)
