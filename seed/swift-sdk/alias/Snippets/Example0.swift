import Foundation
import Alias

private func main() async throws {
    let client = AliasClient(baseURL: "https://api.fern.com")

    try await client.get(typeId: "typeId")
}

try await main()
