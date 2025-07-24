import PackageDescription

let package = Package(
    name: "PackageYml",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PackageYml",
            targets: ["PackageYmlTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PackageYmlTarget",
            path: "Sources"
        )
    ]
)
