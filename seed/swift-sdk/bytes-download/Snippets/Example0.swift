import Foundation
import BytesDownload

private func main() async throws {
    let client = BytesDownloadClient(baseURL: "https://api.fern.com")

    _ = try await client.service.simple()
}

try await main()
