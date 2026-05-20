import Foundation
import ServerSentEventsResumable

private func main() async throws {
    let client = ServerSentEventsResumableClient(baseURL: "https://api.fern.com")

    _ = try await client.completions.streamNonResumable(request: .init(query: "bar"))
}

try await main()
