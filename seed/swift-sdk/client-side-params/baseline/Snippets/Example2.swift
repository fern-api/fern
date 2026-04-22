import Foundation
import ClientSideParams

private func main() async throws {
    let client = ClientSideParamsClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.searchResources(
        limit: 1,
        offset: 1,
        request: .init(
            query: "query",
            filters: [
                "filters": .object([
                    "key": .string("value")
                ])
            ]
        )
    )
}

try await main()
