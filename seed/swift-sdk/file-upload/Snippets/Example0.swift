import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.post(request: .init(
        file: .init(data: Data("".utf8)),
        fileList: .init(data: Data("".utf8)),
        maybeFile: .init(data: Data("".utf8)),
        maybeFileList: .init(data: Data("".utf8))
    ))
}

try await main()
