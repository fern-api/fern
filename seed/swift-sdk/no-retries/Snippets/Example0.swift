import Foundation
import NoRetries

private func main() async throws {
    let client = NoRetriesClient(baseURL: "https://api.fern.com")

    _ = try await client.retries.getUsers()
}

try await main()
