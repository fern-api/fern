import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.params.getWithQuery(
        query: "query",
        number: 1
    )
}

try await main()
