// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Object",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Object",
            targets: ["Object"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Object",
            path: "Sources"
        )
    ]
)
