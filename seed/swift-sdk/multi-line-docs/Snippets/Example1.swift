import Foundation
import MultiLineDocs

private func main() async throws {
    let client = MultiLineDocsClient(baseURL: "https://api.fern.com")

    try await client.user.createUser(request: .init(
        name: "name",
        age: 1
    ))
}

try await main()
