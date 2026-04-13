import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.auth.gettokenwithclientcredentials(request: .init(
        cid: "cid",
        csr: "csr",
        scp: "scp",
        entityId: "entity_id",
        audience: .httpsApiExampleCom,
        grantType: .clientCredentials,
        scope: .value("scope")
    ))
}

try await main()
