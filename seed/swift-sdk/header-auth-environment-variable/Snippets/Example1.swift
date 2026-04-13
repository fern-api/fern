import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        apiKey: "<value>"
    )

    _ = try await client.service.getwithbearertoken()
}

try await main()
