// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Extends",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Extends",
            targets: ["ExtendsTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ExtendsTarget",
            path: "Sources"
        )
    ]
)
