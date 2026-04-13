import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.filterbyrole(
        role: .admin,
        status: .active,
        secondaryRole: .admin
    )
}

try await main()
