import Foundation
import FileUpload

private func main() async throws {
    let client = SeedFileUploadClient()

    try await client.service.simple()
}

try await main()
