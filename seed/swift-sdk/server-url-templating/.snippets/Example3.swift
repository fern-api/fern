import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.getUser(userId: "userId")
}

try await main()
