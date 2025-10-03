import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    try await client.headers.send(request: .init(query: "What is the weather today"))
}

try await main()
