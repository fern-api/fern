// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "BearerTokenEnvironmentVariable",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "BearerTokenEnvironmentVariable",
            targets: ["BearerTokenEnvironmentVariableTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BearerTokenEnvironmentVariableTarget",
            path: "Sources"
        )
    ]
)
