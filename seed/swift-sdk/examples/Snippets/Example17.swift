import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.getMetadata(request: .init(
        shallow: False,
        tag: [
            "development"
        ],
        xApiVersion: "0.0.1"
    ))
}

try await main()
