import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.inlinedRequests.postWithChildResource(request: .init(childResource: ChildResource(
        type: "type",
        document: "document",
        extra: "extra"
    )))
}

try await main()
