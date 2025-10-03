import Foundation
import Testing
import Exhaustive

@Suite("PutClient Wire Tests") struct PutClientWireTests {
    @Test func add1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "errors": [
                    {
                      "category": "API_ERROR",
                      "code": "INTERNAL_SERVER_ERROR",
                      "detail": "detail",
                      "field": "field"
                    },
                    {
                      "category": "API_ERROR",
                      "code": "INTERNAL_SERVER_ERROR",
                      "detail": "detail",
                      "field": "field"
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = PutResponse(
            errors: [
                ErrorType(
                    category: .apiError,
                    code: .internalServerError,
                    detail: "detail",
                    field: "field"
                ),
                ErrorType(
                    category: .apiError,
                    code: .internalServerError,
                    detail: "detail",
                    field: "field"
                )
            ]
        )
        let response = try await client.endpoints.put.add(id: "id")
        try #require(response == expectedResponse)
    }
}