import Foundation
import HeaderTokenEnvironmentVariable

enum Example0 {
    static func snippet() async throws {
        let client = HeaderTokenEnvironmentVariableClient(
            baseURL: "https://api.fern.com",
            headerTokenAuth: "YOUR_HEADER_VALUE"
        )

        _ = try await client.service.getWithBearerToken()
    }
}
