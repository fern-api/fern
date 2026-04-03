import Foundation
import BasicAuthPwOmitted

private func main() async throws {
    let client = BasicAuthPwOmittedClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        password: "<password>"
    )

    _ = try await client.basicAuth.getWithBasicAuth()
}

try await main()
