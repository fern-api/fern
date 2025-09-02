import Foundation
import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = OauthClientCredentialsWithVariablesClient()

    try await client.service.post(endpointParam: "endpointParam")
}

try await main()
