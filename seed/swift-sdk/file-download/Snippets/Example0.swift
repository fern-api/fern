import Foundation
import FileDownload

private func main() async throws {
    let client = FileDownloadClient(baseURL: "https://api.fern.com")

    try await client.service.simple()
}

try await main()
