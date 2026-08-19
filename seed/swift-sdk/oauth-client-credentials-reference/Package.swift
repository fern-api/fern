// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthClientCredentialsReference",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthClientCredentialsReference",
            targets: ["OauthClientCredentialsReference"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentialsReference",
            path: "Sources"
        ),
        .testTarget(
            name: "OauthClientCredentialsReferenceTests",
            dependencies: ["OauthClientCredentialsReference"],
            path: "Tests"
        )
    ]
)
