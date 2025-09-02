import Foundation
import FileDownload

private func main() async throws {
    let client = FileDownloadClient()

    try await client.service.simple()
}

try await main()
