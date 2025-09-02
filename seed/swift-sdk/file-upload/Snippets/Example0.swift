import Foundation
import FileUpload

private func main() async throws {
    let client = FileUploadClient()

    try await client.service.simple()
}

try await main()
