import Pagination

private func main() async throws {
    let client = SeedPaginationClient(token: "<token>")

    try await client.complex.search(
        index: "index",
        request: SearchRequest(
            pagination: StartingAfterPaging(
                perPage: 1,
                startingAfter: "starting_after"
            ),
            query: SearchRequestQuery.singleFilterSearchRequest(
                SingleFilterSearchRequest(
                    field: "field",
                    operator: .equals,
                    value: "value"
                )
            )
        )
    )
}

try await main()
