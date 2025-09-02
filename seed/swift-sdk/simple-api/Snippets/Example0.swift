import Foundation
import SimpleApi

private func main() async throws {
    let client = SimpleApiClient(token: "<token>")

    try await client.user.get(id: "id")
}

try await main()
