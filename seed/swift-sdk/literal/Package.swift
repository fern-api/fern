// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Literal",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Literal",
            targets: ["Literal"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Literal",
            path: "Sources"
        )
    ]
)
