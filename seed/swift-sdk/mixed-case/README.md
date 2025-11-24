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
    .package(url: "https://github.com/mixed-case/fern", from: "0.0.1"),
]
```

## Reference

A full reference for this library is available [here](./reference.md).

## Usage

Instantiate and use the client with the following:

```swift
import Foundation
import MixedCase

private func main() async throws {
    let client = MixedCaseClient()

    _ = try await client.service.getResource(resourceId: "ResourceID")
}

try await main()
```

## Errors

The SDK throws a single error enum for all failures. Client-side issues encoding/decoding failures and network errors use dedicated cases, while non-success HTTP responses are wrapped in an `HTTPError` that exposes the status code, a simple classification and an optional decoded message.

```swift
import MixedCase

let client = MixedCaseClient(...)

do {
    let response = try await client.service.getResource(...)
    // Handle successful response
} catch let error as MixedCaseError {
    switch error {
    case .httpError(let httpError):
        print("Status code:", httpError.statusCode)
        print("Kind:", httpError.kind)
        print("Message:", httpError.body?.message ?? httpError.localizedDescription)
    case .encodingError(let underlying):
        print("Encoding error:", underlying)
    case .networkError(let underlying):
        print("Network error:", underlying)
    default:
        print("Other client error:", error)
    }
} catch {
    print("Unexpected error:", error)
}
```

## Advanced

### Additional Headers

If you would like to send additional headers as part of the request, use the `additionalHeaders` request option.

```swift
try await client.service.getResource(..., requestOptions: .init(
    additionalHeaders: [
        "X-Custom-Header": "custom value"
    ]
))
```

### Additional Query String Parameters

If you would like to send additional query string parameters as part of the request, use the `additionalQueryParameters` request option.

```swift
try await client.service.getResource(..., requestOptions: .init(
    additionalQueryParameters: [
        "custom_query_param_key": "custom_query_param_value"
    ]
))
```

### Timeouts

The SDK defaults to a 60-second timeout. Use the `timeout` option to configure this behavior.

```swift
try await client.service.getResource(..., requestOptions: .init(
    timeout: 30
))
```

### Custom Networking Client

The SDK allows you to customize the underlying `URLSession` used for HTTP requests. Use the `urlSession` option to provide your own configured `URLSession` instance.

```swift
import Foundation
import MixedCase

let client = MixedCaseClient(
    ...,
    urlSession: // Provide your implementation here
)
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
