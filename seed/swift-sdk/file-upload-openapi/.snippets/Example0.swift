import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.fileUploadExample.uploadFile(request: .init(
        file: .init(data: Data("".utf8)),
        name: "name"
    ))
}

try await main()
