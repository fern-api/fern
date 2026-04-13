import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.createusername(request: .init(
        username: "username",
        password: "password",
        name: "name"
    ))
}

try await main()
