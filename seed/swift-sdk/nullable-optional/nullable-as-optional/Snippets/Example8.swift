import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.searchusers(
        query: "query",
        department: .value("department")
    )
}

try await main()
