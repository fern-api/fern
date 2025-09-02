import Foundation
import Streaming

private func main() async throws {
    let client = StreamingClient()

    try await client.dummy.generateStream(request: .init(
        stream: ,
        numEvents: 1
    ))
}

try await main()
