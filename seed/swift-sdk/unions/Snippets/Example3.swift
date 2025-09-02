import Foundation
import Unions

private func main() async throws {
    let client = UnionsClient()

    try await client.bigunion.get(id: "id")
}

try await main()
