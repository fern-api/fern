import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.namedpatchwithmixed(
        id: "id",
        request: .init(
            instructions: .null,
            active: .null
        )
    )
}

try await main()
