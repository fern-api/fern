import PackageDescription

let package = Package(
    name: "ResponseProperty",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ResponseProperty",
            targets: ["ResponsePropertyTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ResponsePropertyTarget",
            path: "Sources"
        )
    ]
)
