import PackageDescription

let package = Package(
    name: "PublicObject",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PublicObject",
            targets: ["PublicObjectTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PublicObjectTarget",
            path: "Sources"
        )
    ]
)
