import Foundation
import MixedFileDirectory

private func main() async throws {
    let client = SeedMixedFileDirectoryClient()

    try await client.organization.create(request: CreateOrganizationRequest(
        name: "name"
    ))
}

try await main()
