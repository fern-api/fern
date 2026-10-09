import Foundation
import MultiUrlEnvironment

enum Example1 {
    static func snippet() async throws {
        let client = MultiUrlEnvironmentClient(token: "<token>")

        _ = try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
    }
}
