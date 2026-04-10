import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.getresource(resourceId: "ResourceID")
}

try await main()
