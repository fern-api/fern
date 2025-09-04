import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient(baseURL: "https://api.fern.com")

    try await client.bigunion.get(id: "id")
}

try await main()
