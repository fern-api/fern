// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "MyCustomModule",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "MyCustomModule",
            targets: ["MyCustomModule"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MyCustomModule",
            path: "Sources"
        )
    ]
)
