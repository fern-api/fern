import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.updatetags(
        userId: "userId",
        request: .init(tags: .null)
    )
}

try await main()
