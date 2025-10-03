import Foundation
import MixedFileDirectory

private func main() async throws {
    let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

    try await client.user.events.metadata.getMetadata(id: "id")
}

try await main()
