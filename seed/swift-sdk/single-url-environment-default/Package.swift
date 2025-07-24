import PackageDescription

let package = Package(
    name: "SingleUrlEnvironmentDefault",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "SingleUrlEnvironmentDefault",
            targets: ["SingleUrlEnvironmentDefaultTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "SingleUrlEnvironmentDefaultTarget",
            path: "Sources"
        )
    ]
)
