import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.contacts.create(request: .init(name: "name"))
}

try await main()
