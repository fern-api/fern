import Foundation
import MixedFileDirectory

enum Example1 {
    static func snippet() async throws {
        let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

        _ = try await client.user.list(limit: 1)
    }
}
