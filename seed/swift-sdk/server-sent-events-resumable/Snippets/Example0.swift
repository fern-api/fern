import Foundation
import ServerSentEventsResumable

private func main() async throws {
    let client = ServerSentEventsResumableClient(baseURL: "https://api.fern.com")

    _ = try await client.completions.stream(request: .init(query: "foo"))
}

try await main()
