import Foundation
import MultiUrlEnvironment

private func main() async throws {
    let client = MultiUrlEnvironmentClient(token: "<token>")

    _ = try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
}

try await main()
