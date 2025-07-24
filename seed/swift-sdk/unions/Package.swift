// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Unions",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Unions",
            targets: ["UnionsTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "UnionsTarget",
            path: "Sources"
        )
    ]
)
