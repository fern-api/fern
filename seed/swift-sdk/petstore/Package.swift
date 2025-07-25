// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Petstore",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Petstore",
            targets: ["PetstoreTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PetstoreTarget",
            path: "Sources"
        )
    ]
)
