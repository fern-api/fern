import Foundation
import BytesUpload

private func main() async throws {
    let client = BytesUploadClient(baseURL: "https://api.fern.com")

    try await client.service.upload(request: )
}

try await main()
