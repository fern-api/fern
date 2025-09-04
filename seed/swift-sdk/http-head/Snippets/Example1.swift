import Foundation
import HttpHead

private func main() async throws {
    let client = HttpHeadClient(baseURL: "https://api.fern.com")

    try await client.user.list(request: .init(limit: 1))
}

try await main()
