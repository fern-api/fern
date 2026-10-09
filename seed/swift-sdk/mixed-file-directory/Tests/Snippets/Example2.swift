import Foundation
import MixedFileDirectory

enum Example2 {
    static func snippet() async throws {
        let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

        _ = try await client.user.events.listEvents(limit: 1)
    }
}
