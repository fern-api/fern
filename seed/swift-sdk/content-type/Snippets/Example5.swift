import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.namedpatchwithmixed(
        id: "id",
        request: .init(
            appId: .value("appId"),
            instructions: .value("instructions"),
            active: .value(true)
        )
    )
}

try await main()
