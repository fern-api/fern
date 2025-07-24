import PackageDescription

let package = Package(
    name: "RequestParameters",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "RequestParameters",
            targets: ["RequestParametersTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "RequestParametersTarget",
            path: "Sources"
        )
    ]
)
