import PackageDescription

let package = Package(
    name: "HttpHead",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "HttpHead",
            targets: ["HttpHeadTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "HttpHeadTarget",
            path: "Sources"
        )
    ]
)
