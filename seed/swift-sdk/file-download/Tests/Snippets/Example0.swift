import Foundation
import FileDownload

enum Example0 {
    static func snippet() async throws {
        let client = FileDownloadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.simple()
    }
}
