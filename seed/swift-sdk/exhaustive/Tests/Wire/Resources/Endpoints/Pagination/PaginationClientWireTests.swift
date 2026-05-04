import Foundation
import Testing
import Exhaustive

@Suite("PaginationClient Wire Tests") struct PaginationClientWireTests {
    @Test func listItems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "items": [
                    {
                      "string": "string"
                    },
                    {
                      "string": "string"
                    }
                  ],
                  "next": "next"
                }
                """#.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PaginatedResponse(
            items: [
                ObjectWithRequiredField(
                    string: "string"
                ),
                ObjectWithRequiredField(
                    string: "string"
                )
            ],
            next: Optional("next")
        )
        let response = try await client.endpoints.pagination.listItems(
            cursor: "cursor",
            limit: 1,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}