// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "LiteralsUnions",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "LiteralsUnions",
            targets: ["LiteralsUnions"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "LiteralsUnions",
            path: "Sources"
        )
    ]
)
