import Foundation
import FileUpload

private func main() async throws {
    let client = FileUploadClient(baseURL: "https://api.fern.com")

    try await client.service.simple()
}

try await main()
