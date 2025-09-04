import Foundation
import BasicAuthEnvironmentVariables

private func main() async throws {
    let client = BasicAuthEnvironmentVariablesClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        accessToken: "<password>"
    )

    try await client.basicAuth.postWithBasicAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
