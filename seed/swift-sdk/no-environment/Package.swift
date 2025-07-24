// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "NoEnvironment",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "NoEnvironment",
            targets: ["NoEnvironmentTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NoEnvironmentTarget",
            path: "Sources"
        )
    ]
)
