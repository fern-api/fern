import Foundation
import AuthEnvironmentVariables

private func main() async throws {
    let client = SeedAuthEnvironmentVariablesClient(apiKey: "<value>")

    try await client.service.getWithApiKey()
}

try await main()
