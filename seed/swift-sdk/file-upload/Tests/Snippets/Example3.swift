import Foundation
import FileUpload

enum Example3 {
    static func snippet() async throws {
        let client = FileUploadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.simple()
    }
}
