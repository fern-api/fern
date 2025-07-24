import PackageDescription

let package = Package(
    name: "Validation",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Validation",
            targets: ["ValidationTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ValidationTarget",
            path: "Sources"
        )
    ]
)
