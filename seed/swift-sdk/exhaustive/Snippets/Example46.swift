import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.noAuth.postWithNoAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
