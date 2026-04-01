import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlinedRequests.postWithBooleanLiteralInRequest(request: .init(
        stream: .bool(false),
        query: "query"
    ))
}

try await main()
