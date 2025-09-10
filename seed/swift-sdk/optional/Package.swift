// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ObjectsWithImports",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ObjectsWithImports",
            targets: ["ObjectsWithImports"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ObjectsWithImports",
            path: "Sources"
        )
    ]
)
