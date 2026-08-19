import Foundation
import BytesUpload

enum Example1 {
    static func snippet() async throws {
        let client = BytesUploadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.uploadWithQueryParams(
            model: "nova-2",
            request: Data("data".utf8)
        )
    }
}
