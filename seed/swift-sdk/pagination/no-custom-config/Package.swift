import PackageDescription

let package = Package(
    name: "Pagination",
    platforms: [
        .iOS(.v15), 
        .macOS(.v12), 
        .tvOS(.v15), 
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Pagination",
            targets: ["PaginationTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PaginationTarget",
            path: "Sources"
        )
    ]
)
