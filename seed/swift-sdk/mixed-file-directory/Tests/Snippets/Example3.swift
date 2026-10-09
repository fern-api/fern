import Foundation
import MixedFileDirectory

enum Example3 {
    static func snippet() async throws {
        let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

        _ = try await client.user.events.metadata.getMetadata(id: "id")
    }
}
