import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    try await client.folder.service.endpoint()
}

try await main()
