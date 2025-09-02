import Foundation
import Version

private func main() async throws {
    let client = VersionClient()

    try await client.user.getUser(userId: "userId")
}

try await main()
