// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "AuthEnvironmentVariables",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "AuthEnvironmentVariables",
            targets: ["AuthEnvironmentVariables"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AuthEnvironmentVariables",
            path: "Sources"
        )
    ]
)
