import Foundation
import Testing
import Api

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
                    }
                  ],
                  "next": "next"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = EndpointsPaginatedResponse(
            items: [
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.endpoints.pagination.listItems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listItems2() async throws -> Void {
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = EndpointsPaginatedResponse(
            items: [
                TypesObjectWithRequiredField(
                    string: "string"
                ),
                TypesObjectWithRequiredField(
                    string: "string"
                )
            ],
            next: Optional(Nullable<String>.value("next"))
        )
        let response = try await client.endpoints.pagination.listItems(
            cursor: .value("cursor"),
            limit: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}