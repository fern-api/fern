// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "ClientSideParams",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ClientSideParams",
            targets: ["ClientSideParams"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ClientSideParams",
            path: "Sources"
        )
    ]
)
