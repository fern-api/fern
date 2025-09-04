import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    try await client.folder.service.unknownRequest(request: .object([
        "key": .string("value")
    ]))
}

try await main()
