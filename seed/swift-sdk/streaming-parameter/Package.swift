import PackageDescription

let package = Package(
    name: "Streaming",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Streaming",
            targets: ["StreamingTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "StreamingTarget",
            path: "Sources"
        )
    ]
)
