// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthPkce",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthPkce",
            targets: ["OauthPkce"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthPkce",
            path: "Sources"
        ),
        .testTarget(
            name: "OauthPkceTests",
            dependencies: ["OauthPkce"],
            path: "Tests"
        )
    ]
)
