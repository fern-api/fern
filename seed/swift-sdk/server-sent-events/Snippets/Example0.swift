import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

    try await client.completions.stream(request: .init(query: "query"))
}

try await main()
