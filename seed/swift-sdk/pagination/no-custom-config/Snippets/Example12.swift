import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.users.listWithGlobalConfig(request: .init(offset: 1))
}

try await main()
