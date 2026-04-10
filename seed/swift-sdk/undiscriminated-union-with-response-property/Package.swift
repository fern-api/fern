// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "UndiscriminatedUnionWithResponseProperty",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "UndiscriminatedUnionWithResponseProperty",
            targets: ["UndiscriminatedUnionWithResponseProperty"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "UndiscriminatedUnionWithResponseProperty",
            path: "Sources"
        ),
        .testTarget(
            name: "UndiscriminatedUnionWithResponsePropertyTests",
            dependencies: ["UndiscriminatedUnionWithResponseProperty"],
            path: "Tests"
        )
    ]
)
