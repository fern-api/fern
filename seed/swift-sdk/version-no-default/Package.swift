import PackageDescription

let package = Package(
    name: "Version",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Version",
            targets: ["VersionTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "VersionTarget",
            path: "Sources"
        )
    ]
)
