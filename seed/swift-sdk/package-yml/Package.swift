// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "PackageYml",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PackageYml",
            targets: ["PackageYml"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PackageYml",
            path: "Sources"
        )
    ]
)
