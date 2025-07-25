// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Enum",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Enum",
            targets: ["EnumTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "EnumTarget",
            path: "Sources"
        )
    ]
)
