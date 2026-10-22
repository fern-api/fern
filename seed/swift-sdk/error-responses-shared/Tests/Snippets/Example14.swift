import Foundation
import Api

enum Example14 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.messages.messages.createMessage(request: Message(
            sid: "sid",
            body: "body"
        ))
    }
}
