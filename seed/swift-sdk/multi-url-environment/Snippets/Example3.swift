import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.s3.getpresignedurl(request: .init(s3Key: "s3Key"))
}

try await main()
