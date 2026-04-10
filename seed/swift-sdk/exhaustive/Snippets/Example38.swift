import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.params.getWithInlinePathAndQuery(
        param: "param",
        query: "query"
    )
}

try await main()
