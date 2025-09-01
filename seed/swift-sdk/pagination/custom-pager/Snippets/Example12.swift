import Pagination

let client = SeedPaginationClient(token: "<token>")

private func main() async throws {
    try await client.users.listWithGlobalConfig(
        request: .init(offset: 1)
    )
}

try await main()
