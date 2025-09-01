import HttpHead

private func main() async throws {
    let client = SeedHttpHeadClient()

    try await client.user.list(request: .init(limit: 1))
}

try await main()
