// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "BasicAuthPwOmitted",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "BasicAuthPwOmitted",
            targets: ["BasicAuthPwOmitted"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "BasicAuthPwOmitted",
            path: "Sources"
        ),
        .testTarget(
            name: "BasicAuthPwOmittedTests",
            dependencies: ["BasicAuthPwOmitted"],
            path: "Tests"
        )
    ]
)
