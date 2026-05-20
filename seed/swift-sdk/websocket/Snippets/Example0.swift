import Foundation
import Websocket

private func main() async throws {
    let client = WebsocketClient(baseURL: "https://api.fern.com")

    _ = try await client.status.getStatus()
}

try await main()
