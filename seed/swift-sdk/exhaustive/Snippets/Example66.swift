import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.reqWithHeaders.getWithCustomHeader(request: .init(body: "string"))
}

try await main()
