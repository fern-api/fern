import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>",
        apiKey: "<X-Api-Key>"
    )

    _ = try await client.v1.listUsers()
}

try await main()
