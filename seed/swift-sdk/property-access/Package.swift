// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "PropertyAccess",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "PropertyAccess",
            targets: ["PropertyAccess"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "PropertyAccess",
            path: "Sources"
        ),
        .testTarget(
            name: "PropertyAccessTests",
            dependencies: ["PropertyAccess"],
            path: "Tests"
        )
    ]
)
