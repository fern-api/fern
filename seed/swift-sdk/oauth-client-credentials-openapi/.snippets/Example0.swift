import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.identity.getToken(request: .init(
        username: "username",
        password: "password"
    ))
}

try await main()
