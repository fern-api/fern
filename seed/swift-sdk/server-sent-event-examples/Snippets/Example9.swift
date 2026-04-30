import Foundation
import ServerSentEvents

private func main() async throws {
    let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

    _ = try await client.completions.streamEventsDiscriminantInData(request: .init(query: "query"))
}

try await main()
