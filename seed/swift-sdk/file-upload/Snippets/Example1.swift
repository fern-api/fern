import Foundation
import FileUpload

private func main() async throws {
    let client = FileUploadClient(baseURL: "https://api.fern.com")

    _ = try await client.service.optionalArgs(request: .init(
        imageFile: .init(data: Data("".utf8)),
        request: 
    ))
}

try await main()
