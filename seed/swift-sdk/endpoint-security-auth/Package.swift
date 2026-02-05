// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "EndpointSecurityAuth",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "EndpointSecurityAuth",
            targets: ["EndpointSecurityAuth"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "EndpointSecurityAuth",
            path: "Sources"
        ),
        .testTarget(
            name: "EndpointSecurityAuthTests",
            dependencies: ["EndpointSecurityAuth"],
            path: "Tests"
        )
    ]
)
