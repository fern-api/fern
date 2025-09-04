import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient(baseURL: "https://api.fern.com")

    try await client.nullable.deleteUser(request: .init(username: "xy"))
}

try await main()
