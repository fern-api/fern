import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.get(id: "id")
}

try await main()
