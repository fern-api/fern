import PackageDescription

let package = Package(
    name: "Variables",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Variables",
            targets: ["VariablesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "VariablesTarget",
            path: "Sources"
        )
    ]
)
