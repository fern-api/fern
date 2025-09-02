import Foundation
import BearerTokenEnvironmentVariable

private func main() async throws {
    let client = SeedBearerTokenEnvironmentVariableClient(apiKey: "<token>")

    try await client.service.getWithBearerToken()
}

try await main()
