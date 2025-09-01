import MixedFileDirectory

let client = SeedMixedFileDirectoryClient()

private func main() async throws {
    try await client.user.list(
        request: .init(limit: 1)
    )
}

try await main()
