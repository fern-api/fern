import Foundation
import BasicAuth

private func main() async throws {
    let client = BasicAuthClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        password: "<password>"
    )

    _ = try await client.basicAuth.getWithBasicAuth()
}

try await main()
