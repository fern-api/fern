import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient()

    try await client.completions.stream(request: .init(query: "query"))
}

try await main()
