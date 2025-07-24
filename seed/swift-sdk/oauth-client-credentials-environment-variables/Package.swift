// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "OauthClientCredentialsEnvironmentVariables",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "OauthClientCredentialsEnvironmentVariables",
            targets: ["OauthClientCredentialsEnvironmentVariablesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentialsEnvironmentVariablesTarget",
            path: "Sources"
        )
    ]
)
