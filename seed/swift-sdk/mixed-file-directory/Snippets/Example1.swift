import Foundation
import MixedFileDirectory

private func main() async throws {
    let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

    try await client.user.list(request: .init(limit: 1))
}

try await main()
