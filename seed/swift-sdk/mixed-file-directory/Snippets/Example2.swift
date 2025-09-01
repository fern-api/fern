import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

private func main() async throws {
    try await client.user.events.listEvents(
        request: .init(limit: 1)
    )
}

try await main()
