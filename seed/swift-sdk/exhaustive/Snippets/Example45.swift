import Foundation
import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.noAuth.postWithNoAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
