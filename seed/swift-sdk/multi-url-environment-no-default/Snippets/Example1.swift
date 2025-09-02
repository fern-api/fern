import Foundation
import MultiUrlEnvironmentNoDefault

private func main() async throws {
    let client = MultiUrlEnvironmentNoDefaultClient(token: "<token>")

    try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
}

try await main()
