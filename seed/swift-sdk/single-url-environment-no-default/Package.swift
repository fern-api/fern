import PackageDescription

let package = Package(
    name: "SingleUrlEnvironmentNoDefault",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "SingleUrlEnvironmentNoDefault",
            targets: ["SingleUrlEnvironmentNoDefaultTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "SingleUrlEnvironmentNoDefaultTarget",
            path: "Sources"
        )
    ]
)
