import Foundation
import BearerTokenEnvironmentVariable

private func main() async throws {
    let client = BearerTokenEnvironmentVariableClient(
        baseURL: "https://api.fern.com",
        apiKey: "<token>"
    )

    _ = try await client.service.getWithBearerToken()
}

try await main()
