import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.service.searchresources(
        limit: 1,
        offset: 1,
        request: .init(
            query: .value("query"),
            filters: .value([
                "filters": .object([
                    "key": .string("value")
                ])
            ])
        )
    )
}

try await main()
