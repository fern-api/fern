import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.complex.search(
        index: "index",
        request: .init(
            pagination: StartingAfterPaging(
                perPage: 1,
                startingAfter: .value("starting_after")
            ),
            query: SearchRequestQuery.singleFilterSearchRequest(
                SingleFilterSearchRequest(
                    field: .value("field"),
                    operator: .equalTo,
                    value: .value("value")
                )
            )
        )
    )
}

try await main()
