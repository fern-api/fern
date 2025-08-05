// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "AliasExtends",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "AliasExtends",
            targets: ["AliasExtends"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AliasExtends",
            path: "Sources"
        )
    ]
)
