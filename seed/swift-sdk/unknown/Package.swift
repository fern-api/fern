// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "UnknownAsAny",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "UnknownAsAny",
            targets: ["UnknownAsAnyTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "UnknownAsAnyTarget",
            path: "Sources"
        )
    ]
)
