import PackageDescription

let package = Package(
    name: "Alias",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Alias",
            targets: ["AliasTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AliasTarget",
            path: "Sources"
        )
    ]
)
