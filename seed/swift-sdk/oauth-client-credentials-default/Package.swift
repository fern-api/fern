// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthClientCredentialsDefault",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthClientCredentialsDefault",
            targets: ["OauthClientCredentialsDefault"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentialsDefault",
            path: "Sources"
        )
    ]
)
