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
            targets: ["OauthClientCredentialsWithVariablesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "OauthClientCredentialsWithVariablesTarget",
            path: "Sources"
        )
    ]
)
