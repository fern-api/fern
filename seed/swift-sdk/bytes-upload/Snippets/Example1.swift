import Foundation
import BytesUpload

private func main() async throws {
    let client = BytesUploadClient(baseURL: "https://api.fern.com")

    _ = try await client.service.uploadWithQueryParams(
        model: "nova-2",
        request: .init(body: Data("data".utf8))
    )
}

try await main()
