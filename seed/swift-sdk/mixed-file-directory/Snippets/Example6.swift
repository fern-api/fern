import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.userEventsMetadata.userEventsMetadataGetMetadata(id: "id")
}

try await main()
