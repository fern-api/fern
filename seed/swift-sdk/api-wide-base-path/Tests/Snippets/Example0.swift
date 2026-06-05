import Foundation
import ApiWideBasePath

enum Example0 {
    static func snippet() async throws {
        let client = ApiWideBasePathClient(baseURL: "https://api.fern.com")

        _ = try await client.service.post(
            pathParam: "pathParam",
            serviceParam: "serviceParam",
            endpointParam: 1,
            resourceParam: "resourceParam"
        )
    }
}
