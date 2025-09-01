import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

private func main() async throws {
    try await client.organization.create(
        request: CreateOrganizationRequest(
            name: "name"
        )
    )
}

try await main()
