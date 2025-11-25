import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.types.get(id: "date-example")
}

try await main()
