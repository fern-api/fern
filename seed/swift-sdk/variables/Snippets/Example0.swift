import Foundation
import Variables

private func main() async throws {
    let client = VariablesClient()

    try await client.service.post(endpointParam: "endpointParam")
}

try await main()
