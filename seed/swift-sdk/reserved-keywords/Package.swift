// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "NurseryApi",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "NurseryApi",
            targets: ["NurseryApiTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "NurseryApiTarget",
            path: "Sources"
        )
    ]
)
