import Foundation
import Examples

enum Example5 {
    static func snippet() async throws {
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.file.service.getFile(
            filename: "file.txt",
            xFileApiVersion: "0.0.2"
        )
    }
}
