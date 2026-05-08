import Foundation
import Api

private func main() async throws {
    let client = ApiClient()

    _ = try await client.getUsers()
}

try await main()
