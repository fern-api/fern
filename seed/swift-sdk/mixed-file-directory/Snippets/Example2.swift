import Foundation
import MixedFileDirectory

private func main() async throws {
    let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

    _ = try await client.user.events.listEvents(limit: 1)
}

try await main()
