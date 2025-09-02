import Foundation
import OauthClientCredentialsWithVariables

private func main() async throws {
    let client = OauthClientCredentialsWithVariablesClient(baseURL: "https://api.fern.com")

    try await client.service.post(endpointParam: "endpointParam")
}

try await main()
