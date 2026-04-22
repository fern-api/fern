import Foundation
import NurseryApi

private func main() async throws {
    let client = NurseryApiClient(baseURL: "https://api.fern.com")

    _ = try await client.package.test(for: "for")
}

try await main()
