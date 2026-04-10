import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>",
        apiKey: "<X-API-Key>"
    )

    _ = try await client.user.getwithanyauth()
}

try await main()
