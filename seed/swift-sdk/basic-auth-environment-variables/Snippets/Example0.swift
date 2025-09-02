import Foundation
import BasicAuthEnvironmentVariables

private func main() async throws {
    let client = BasicAuthEnvironmentVariablesClient(
        username: "<username>",
        accessToken: "<password>"
    )

    try await client.basicAuth.getWithBasicAuth()
}

try await main()
