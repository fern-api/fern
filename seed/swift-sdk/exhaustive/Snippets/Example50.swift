import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.reqWithHeaders.getWithCustomHeader(request: .init(body: "string"))
}

try await main()
