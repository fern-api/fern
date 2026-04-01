import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.testGet(
        region: "region",
        limit: "100"
    )
}

try await main()
