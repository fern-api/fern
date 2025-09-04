import Foundation
import Version

private func main() async throws {
    let client = VersionClient(baseURL: "https://api.fern.com")

    try await client.user.getUser(userId: "userId")
}

try await main()
