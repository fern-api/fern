// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "UnionQueryParameters",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "UnionQueryParameters",
            targets: ["UnionQueryParameters"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "UnionQueryParameters",
            path: "Sources"
        ),
        .testTarget(
            name: "UnionQueryParametersTests",
            dependencies: ["UnionQueryParameters"],
            path: "Tests"
        )
    ]
)
