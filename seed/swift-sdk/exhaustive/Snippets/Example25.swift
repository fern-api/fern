import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.endpoints.params.getWithPathAndQuery(
        param: "param",
        request: .init(
            param: "param",
            query: "query"
        )
    )
}

try await main()
