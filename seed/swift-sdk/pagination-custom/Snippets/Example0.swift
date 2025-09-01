import Pagination

let client = SeedPaginationClient(token: "<token>")

private func main() async throws {
    try await client.users.listUsernamesCustom(
        request: .init(startingAfter: "starting_after")
    )
}

try await main()
