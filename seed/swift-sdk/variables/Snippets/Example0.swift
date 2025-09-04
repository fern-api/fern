import Foundation
import Variables

private func main() async throws {
    let client = VariablesClient(baseURL: "https://api.fern.com")

    try await client.service.post(endpointParam: "endpointParam")
}

try await main()
