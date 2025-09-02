import Foundation
import BasicAuth

private func main() async throws {
    let client = SeedBasicAuthClient(
        username: "<username>",
        password: "<password>"
    )

    try await client.basicAuth.postWithBasicAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
