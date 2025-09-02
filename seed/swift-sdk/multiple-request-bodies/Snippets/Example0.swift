import Foundation
import Api

private func main() async throws {
    let client = ApiClient(token: "<token>")

    try await client.uploadJsonDocument(request: .init())
}

try await main()
