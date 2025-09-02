import Foundation
import InferredAuthExplicit

private func main() async throws {
    let client = InferredAuthExplicitClient()

    try await client.auth.getTokenWithClientCredentials(request: .init(
        xApiKey: "X-Api-Key",
        clientId: "client_id",
        clientSecret: "client_secret",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: "scope"
    ))
}

try await main()
