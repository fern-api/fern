import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

try await client.user.events.metadata.getMetadata(
    request: .init(id: "id")
)
