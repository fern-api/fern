import Foundation
import Streaming

private func main() async throws {
    let client = StreamingClient(baseURL: "https://api.fern.com")

    _ = try await client.dummy.generateStream(request: .init(numEvents: 1))
}

try await main()
