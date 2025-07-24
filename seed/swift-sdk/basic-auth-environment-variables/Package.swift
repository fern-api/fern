// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "BasicAuthEnvironmentVariables",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "BasicAuthEnvironmentVariables",
            targets: ["BasicAuthEnvironmentVariablesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BasicAuthEnvironmentVariablesTarget",
            path: "Sources"
        )
    ]
)
