import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

try await client.user.events.listEvents(
    request: .init(limit: 1)
)
