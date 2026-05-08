import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.submitFormData(request: .init(
        username: "username",
        email: "email"
    ))
}

try await main()
