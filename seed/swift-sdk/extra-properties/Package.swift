import PackageDescription

let package = Package(
    name: "ExtraProperties",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "ExtraProperties",
            targets: ["ExtraPropertiesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ExtraPropertiesTarget",
            path: "Sources"
        )
    ]
)
