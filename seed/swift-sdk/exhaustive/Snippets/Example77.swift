import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.params.getWithInlinePathAndQuery(
        param: "param",
        query: "query"
    )
}

try await main()
