// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ApiWideBasePath",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ApiWideBasePath",
            targets: ["ApiWideBasePathTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ApiWideBasePathTarget",
            path: "Sources"
        )
    ]
)
