// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ContentTypes",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ContentTypes",
            targets: ["ContentTypesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ContentTypesTarget",
            path: "Sources"
        )
    ]
)
