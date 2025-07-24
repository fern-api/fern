// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "MultiUrlEnvironmentNoDefault",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "MultiUrlEnvironmentNoDefault",
            targets: ["MultiUrlEnvironmentNoDefaultTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MultiUrlEnvironmentNoDefaultTarget",
            path: "Sources"
        )
    ]
)
