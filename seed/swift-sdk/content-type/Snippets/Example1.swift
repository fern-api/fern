import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.patch(request: .init(
        application: .value("application"),
        requireAuth: .value(true)
    ))
}

try await main()
