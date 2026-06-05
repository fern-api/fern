import Foundation
import PathParameters

enum Example1 {
    static func snippet() async throws {
        let client = PathParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.organizations.getOrganizationUser(
            organizationId: "organization_id",
            userId: "user_id"
        )
    }
}
