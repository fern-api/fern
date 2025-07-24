import PackageDescription

let package = Package(
    name: "PathParameters",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PathParameters",
            targets: ["PathParametersTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PathParametersTarget",
            path: "Sources"
        )
    ]
)
