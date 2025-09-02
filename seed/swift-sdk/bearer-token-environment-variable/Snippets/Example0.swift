import Foundation
import BearerTokenEnvironmentVariable

private func main() async throws {
    let client = BearerTokenEnvironmentVariableClient(apiKey: "<token>")

    try await client.service.getWithBearerToken()
}

try await main()
