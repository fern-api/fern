import PackageDescription

let package = Package(
    name: "ErrorProperty",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ErrorProperty",
            targets: ["ErrorPropertyTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ErrorPropertyTarget",
            path: "Sources"
        )
    ]
)
