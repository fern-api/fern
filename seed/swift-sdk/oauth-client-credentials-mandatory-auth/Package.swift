// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthClientCredentialsMandatoryAuth",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthClientCredentialsMandatoryAuth",
            targets: ["OauthClientCredentialsMandatoryAuth"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentialsMandatoryAuth",
            path: "Sources"
        ),
        .testTarget(
            name: "OauthClientCredentialsMandatoryAuthTests",
            dependencies: ["OauthClientCredentialsMandatoryAuth"],
            path: "Tests"
        )
    ]
)
