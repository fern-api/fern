// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "MultiLineDocs",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "MultiLineDocs",
            targets: ["MultiLineDocsTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "MultiLineDocsTarget",
            path: "Sources"
        )
    ]
)
