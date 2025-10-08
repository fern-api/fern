import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

    _ = try await client.completions.stream(request: .init(query: "foo"))
}

try await main()
