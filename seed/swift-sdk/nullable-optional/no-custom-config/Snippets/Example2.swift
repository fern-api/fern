import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.updateuser(
        userId: "userId",
        request: .init()
    )
}

try await main()
