// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "PaginationUriPath",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PaginationUriPath",
            targets: ["PaginationUriPath"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PaginationUriPath",
            path: "Sources"
        ),
        .testTarget(
            name: "PaginationUriPathTests",
            dependencies: ["PaginationUriPath"],
            path: "Tests"
        )
    ]
)
