import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.user.createusernameoptional(request: .init(
        username: .value("username"),
        password: .value("password"),
        name: .value("name")
    ))
}

try await main()
