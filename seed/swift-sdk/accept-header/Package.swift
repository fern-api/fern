// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Accept",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Accept",
            targets: ["AcceptTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AcceptTarget",
            path: "Sources"
        )
    ]
)
