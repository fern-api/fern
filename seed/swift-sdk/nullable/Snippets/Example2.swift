import Foundation
import Nullable

private func main() async throws {
    let client = NullableClient()

    try await client.nullable.deleteUser(request: .init(username: "xy"))
}

try await main()
