import Foundation
import MultiUrlEnvironmentNoDefault

enum Example1 {
    static func snippet() async throws {
        let client = MultiUrlEnvironmentNoDefaultClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
    }
}
