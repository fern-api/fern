import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        username: "<username>",
        password: "<password>"
    )

    _ = try await client.basicauth.postwithbasicauth(request: .object([
        "key": .string("value")
    ]))
}

try await main()
