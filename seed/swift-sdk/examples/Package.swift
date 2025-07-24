// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Examples",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Examples",
            targets: ["ExamplesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ExamplesTarget",
            path: "Sources"
        )
    ]
)
