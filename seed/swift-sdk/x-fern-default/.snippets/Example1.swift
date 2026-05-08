import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.testGet(
        region: "region",
        limit: "limit"
    )
}

try await main()
