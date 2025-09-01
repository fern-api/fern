import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

try await client.user.list(
    request: .init(limit: 1)
)
