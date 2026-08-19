import Foundation
import Api

enum Example6 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.folder.service.unknownRequest(request: .object([
            "key": .string("value")
        ]))
    }
}
