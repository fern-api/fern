// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthClientCredentials",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthClientCredentials",
            targets: ["OauthClientCredentials"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentials",
            path: "Sources"
        )
    ]
)
