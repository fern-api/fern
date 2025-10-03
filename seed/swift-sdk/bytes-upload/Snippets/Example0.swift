import Foundation
import BytesUpload

private func main() async throws {
    let client = BytesUploadClient(baseURL: "https://api.fern.com")

    _ = try await client.service.upload(request: Data("data".utf8))
}

try await main()
