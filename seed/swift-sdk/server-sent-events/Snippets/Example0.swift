import Foundation
import ServerSentEvents

private func main() async throws {
    let client = SeedServerSentEventsClient()

    try await client.completions.stream(request: .init(query: "query"))
}

try await main()
