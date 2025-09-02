import Foundation
import SimpleApi

private func main() async throws {
    let client = SimpleApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.user.get(id: "id")
}

try await main()
