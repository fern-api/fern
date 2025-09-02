import Foundation
import Streaming

private func main() async throws {
    let client = StreamingClient()

    try await client.dummy.generate(request: .init(
        stream: ,
        numEvents: 5
    ))
}

try await main()
