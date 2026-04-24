import Foundation
import BasicAuthPwOmitted

private func main() async throws {
    let client = BasicAuthPwOmittedClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        password: ""
    )

    _ = try await client.basicAuth.postWithBasicAuth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
