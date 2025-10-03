import Foundation
import Variables

private func main() async throws {
    let client = VariablesClient(baseURL: "https://api.fern.com")

    try await client.service.post()
}

try await main()
