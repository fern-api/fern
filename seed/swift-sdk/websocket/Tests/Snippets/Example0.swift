import Foundation
import Websocket

enum Example0 {
    static func snippet() async throws {
        let client = WebsocketClient(baseURL: "https://api.fern.com")

        _ = try await client.status.getStatus()
    }
}
