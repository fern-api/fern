import MixedFileDirectory

private func main() async throws {
    let client = SeedMixedFileDirectoryClient()

    try await client.user.list(request: .init(limit: 1))
}

try await main()
