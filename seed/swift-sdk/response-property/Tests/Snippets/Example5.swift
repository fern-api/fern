import Foundation
import ResponseProperty

enum Example5 {
    static func snippet() async throws {
        let client = ResponsePropertyClient(baseURL: "https://api.fern.com")

        _ = try await client.service.getOptionalMovieDocs(request: "string")
    }
}
