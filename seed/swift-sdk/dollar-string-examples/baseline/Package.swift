// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "DollarStringExamples",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "DollarStringExamples",
            targets: ["DollarStringExamples"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "DollarStringExamples",
            path: "Sources"
        ),
        .testTarget(
            name: "DollarStringExamplesTests",
            dependencies: ["DollarStringExamples"],
            path: "Tests"
        )
    ]
)
