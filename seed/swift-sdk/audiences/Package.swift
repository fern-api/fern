// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "Audiences",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "Audiences",
            targets: ["AudiencesTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "AudiencesTarget",
            path: "Sources"
        )
    ]
)
