import Foundation
import AnyAuth

private func main() async throws {
    let client = SeedAnyAuthClient(token: "<token>")

    try await client.user.get()
}

try await main()
