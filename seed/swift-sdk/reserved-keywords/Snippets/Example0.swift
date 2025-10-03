import Foundation
import NurseryApi

private func main() async throws {
    let client = NurseryApiClient(baseURL: "https://api.fern.com")

    try await client.package.test(for: "for")
}

try await main()
