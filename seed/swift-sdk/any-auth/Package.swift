import PackageDescription

let package = Package(
    name: "AnyAuth",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "AnyAuth",
            targets: ["AnyAuthTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AnyAuthTarget",
            path: "Sources"
        )
    ]
)
