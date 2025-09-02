import Foundation
import AuthEnvironmentVariables

private func main() async throws {
    let client = AuthEnvironmentVariablesClient(apiKey: "<value>")

    try await client.service.getWithApiKey()
}

try await main()
