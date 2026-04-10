import Foundation
import FileUpload

private func main() async throws {
    let client = FileUploadClient(baseURL: "https://api.fern.com")

    _ = try await client.service.justFile(request: .init(file: .init(data: Data("".utf8))))
}

try await main()
