import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

try await client.organization.create(
    request: CreateOrganizationRequest(
        name: "name"
    )
)
