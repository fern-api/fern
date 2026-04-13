import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.patchcomplex(
        id: "id",
        request: .init()
    )
}

try await main()
