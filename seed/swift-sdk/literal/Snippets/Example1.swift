import Foundation
import Literal

private func main() async throws {
    let client = LiteralClient(baseURL: "https://api.fern.com")

    _ = try await client.headers.send(request: .init(query: "query"))
}

try await main()
