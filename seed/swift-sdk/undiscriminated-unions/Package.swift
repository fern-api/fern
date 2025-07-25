// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "UndiscriminatedUnions",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "UndiscriminatedUnions",
            targets: ["UndiscriminatedUnionsTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "UndiscriminatedUnionsTarget",
            path: "Sources"
        )
    ]
)
