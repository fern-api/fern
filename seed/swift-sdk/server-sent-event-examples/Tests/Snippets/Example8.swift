import Foundation
import ServerSentEvents

enum Example8 {
    static func snippet() async throws {
        let client = ServerSentEventsClient(baseURL: "https://api.fern.com")

        _ = try await client.completions.streamEventsDiscriminantInData(request: .init(query: "query"))
    }
}
