import Foundation
import HeaderToken

enum Example0 {
    static func snippet() async throws {
        let client = HeaderTokenClient(
            baseURL: "https://api.fern.com",
            headerTokenAuth: "YOUR_API_KEY"
        )

        _ = try await client.service.getWithBearerToken()
    }
}
