# Seed Swift Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=Seed%2FSwift)
![SwiftPM compatible](https://img.shields.io/badge/SwiftPM-compatible-orange.svg)

The Seed Swift library provides convenient access to the Seed APIs from Swift.

## Requirements

This SDK requires:
- Swift 5.7+
- iOS 15+
- macOS 12+
- tvOS 15+
- watchOS 8+

## Installation

With Swift Package Manager (SPM), add the following to the top-level `dependencies` array within your `Package.swift` file:

```swift
dependencies: [
    .package(url: "<git-url>", from: "0.1.0"),
]
```

## Usage

Instantiate and use the client with the following:

```swift
import Foundation
import QueryParameters

private func main() async throws {
    let client = QueryParametersClient()

    try await client.user.getUsername(request: .init(
        limit: 1,
        id: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        date: try! Date("2023-01-15T00:00:00Z", strategy: .iso8601),
        deadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        bytes: "SGVsbG8gd29ybGQh",
        user: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        userList: [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            ),
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ],
        optionalDeadline: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        keyValue: [
            "keyValue": "keyValue"
        ],
        optionalString: "optionalString",
        nestedUser: NestedUser(
            name: "name",
            user: User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ),
        optionalUser: User(
            name: "name",
            tags: [
                "tags",
                "tags"
            ]
        ),
        excludeUser: [
            User(
                name: "name",
                tags: [
                    "tags",
                    "tags"
                ]
            )
        ],
        filter: [
            "filter"
        ]
    ))
}

try await main()
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!