import Foundation
import Exhaustive

enum Example41 {
    static func snippet() async throws {
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.endpoints.params.uploadWithPath(
            param: "upload-path",
            request: Data("data".utf8)
        )
    }
}
