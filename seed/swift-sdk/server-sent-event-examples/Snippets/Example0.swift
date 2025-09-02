import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient()

    try await client.completions.stream(request: .init(query: "foo"))
}

try await main()
