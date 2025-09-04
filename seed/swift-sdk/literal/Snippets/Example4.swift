import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    try await client.path.send(id: .value)
}

try await main()
