import Foundation
import BytesDownload

enum Example0 {
    static func snippet() async throws {
        let client = BytesDownloadClient(baseURL: "https://api.fern.com")

        _ = try await client.service.simple()
    }
}
