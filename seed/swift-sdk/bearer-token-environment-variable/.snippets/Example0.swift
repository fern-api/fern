import Foundation
import BearerTokenEnvironmentVariable

private func main() async throws {
    let client = BearerTokenEnvironmentVariableClient(
        baseURL: "https://api.fern.com",
        apiKey: "YOUR_API_KEY"
    )

    _ = try await client.service.getWithBearerToken()
}

try await main()
