import PackageDescription

let package = Package(
    name: "CrossPackageTypeNames",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "CrossPackageTypeNames",
            targets: ["CrossPackageTypeNamesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "CrossPackageTypeNamesTarget",
            path: "Sources"
        )
    ]
)
