import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.fileUploadExample.uploadFile(request: .init(
        name: "name",
        file: .init(data: Data("".utf8))
    ))
}

try await main()
