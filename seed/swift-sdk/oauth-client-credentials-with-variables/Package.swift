// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthClientCredentialsWithVariables",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthClientCredentialsWithVariables",
            targets: ["OauthClientCredentialsWithVariables"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentialsWithVariables",
            path: "Sources"
        )
    ]
)
