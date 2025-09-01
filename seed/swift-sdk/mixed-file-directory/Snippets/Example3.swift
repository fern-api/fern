import MixedFileDirectory

private func main() async throws {
    let client = SeedMixedFileDirectoryClient()

    try await client.user.events.metadata.getMetadata(request: .init(id: "id"))
}

try await main()
