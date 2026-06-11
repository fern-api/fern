import Foundation
import Pagination

enum Example0 {
    static func snippet() async throws {
        let client = PaginationClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.complex.search(
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
}
