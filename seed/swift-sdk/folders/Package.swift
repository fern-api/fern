// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Api",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Api",
            targets: ["Api"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "Api",
            path: "Sources"
        )
    ]
)
