import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.searchResources(request: .init(
        limit: 1,
        offset: 1,
        query: "query",
        filters: [
            "filters": .object([
                "key": .string("value")
            ])
        ]
    ))
}

try await main()
