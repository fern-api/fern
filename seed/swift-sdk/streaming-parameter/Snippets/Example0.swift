import Foundation
import Streaming

private func main() async throws {
    let client = StreamingClient(baseURL: "https://api.fern.com")

    try await client.dummy.generate(request: .init(
        stream: False,
        numEvents: 5
    ))
}

try await main()
