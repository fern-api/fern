import Foundation
import PathParameters

private func main() async throws {
    let client = PathParametersClient(baseURL: "https://api.fern.com")

    try await client.organizations.searchOrganizations(
        organizationId: "organization_id",
        limit: 1
    )
}

try await main()
