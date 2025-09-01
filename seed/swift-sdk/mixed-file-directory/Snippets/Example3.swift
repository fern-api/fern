import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

private func main() async throws {
    try await client.user.events.metadata.getMetadata(
        request: .init(id: "id")
    )
}

try await main()
