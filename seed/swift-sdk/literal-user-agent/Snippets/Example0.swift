import Foundation
import LiteralUserAgent

private func main() async throws {
    let client = LiteralUserAgentClient(baseURL: "https://api.fern.com")

    _ = try await client.ping()
}

try await main()
