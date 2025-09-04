import Foundation
import MultiLineDocs

private func main() async throws {
    let client = MultiLineDocsClient(baseURL: "https://api.fern.com")

    try await client.user.getUser(userId: "userId")
}

try await main()
