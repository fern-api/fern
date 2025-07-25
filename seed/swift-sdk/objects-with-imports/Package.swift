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
            targets: ["ObjectsWithImportsTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ObjectsWithImportsTarget",
            path: "Sources"
        )
    ]
)
