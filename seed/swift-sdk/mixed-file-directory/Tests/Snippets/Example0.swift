import Foundation
import MixedFileDirectory

enum Example0 {
    static func snippet() async throws {
        let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

        _ = try await client.organization.create(request: CreateOrganizationRequest(
            name: "name"
        ))
    }
}
