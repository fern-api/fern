// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "FileUpload",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "FileUpload",
            targets: ["FileUploadTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "FileUploadTarget",
            path: "Sources"
        )
    ]
)
