// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "MultiUrlEnvironment",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "MultiUrlEnvironment",
            targets: ["MultiUrlEnvironment"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MultiUrlEnvironment",
            path: "Sources"
        )
    ]
)
