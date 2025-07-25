// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "EmptyClients",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "EmptyClients",
            targets: ["EmptyClientsTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "EmptyClientsTarget",
            path: "Sources"
        )
    ]
)
