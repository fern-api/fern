// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "MixedCase",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "MixedCase",
            targets: ["MixedCaseTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MixedCaseTarget",
            path: "Sources"
        )
    ]
)
