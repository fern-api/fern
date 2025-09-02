import Foundation
import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.service.getMetadata(request: .init(
        shallow: True,
        tag: [
            "tag"
        ],
        xApiVersion: "X-API-Version"
    ))
}

try await main()
