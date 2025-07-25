// swift-tools-version: 5.7

import PackageDescription

let package = Package(
    name: "FileDownload",
    platforms: [
        .iOS(.v15),
        .macOS(.v12),
        .tvOS(.v15),
        .watchOS(.v8)
    ],
    products: [
        .library(
            name: "FileDownload",
            targets: ["FileDownloadTarget"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "FileDownloadTarget",
            path: "Sources"
        )
    ]
)
