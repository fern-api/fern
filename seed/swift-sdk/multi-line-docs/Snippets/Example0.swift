import Foundation
import MultiLineDocs

private func main() async throws {
    let client = MultiLineDocsClient()

    try await client.user.getUser(userId: "userId")
}

try await main()
