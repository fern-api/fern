import Foundation
import BasicAuthEnvironmentVariables

private func main() async throws {
    let client = BasicAuthEnvironmentVariablesClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        accessToken: "<password>"
    )

    _ = try await client.basicAuth.getWithBasicAuth()
}

try await main()
