import Foundation
import BasicAuthEnvironmentVariables

private func main() async throws {
    let client = BasicAuthEnvironmentVariablesClient(
        username: "<username>",
        accessToken: "<password>"
    )

    try await client.basicAuth.postWithBasicAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
