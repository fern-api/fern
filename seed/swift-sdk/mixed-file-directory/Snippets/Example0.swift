import Foundation
import MixedFileDirectory

private func main() async throws {
    let client = MixedFileDirectoryClient(baseURL: "https://api.fern.com")

    try await client.organization.create(request: CreateOrganizationRequest(
        name: "name"
    ))
}

try await main()
