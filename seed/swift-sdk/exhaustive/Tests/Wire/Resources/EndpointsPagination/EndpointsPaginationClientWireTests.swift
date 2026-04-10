import Foundation
import Testing
import Api

@Suite("EndpointsPaginationClient Wire Tests") struct EndpointsPaginationClientWireTests {
    @Test func endpointsPaginationListItems1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "items": [
                    {
                      "string": "string"
                    }
                  ],
                  "next": "next"
                }
                """.utf8
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
        let response = try await client.endpointsPagination.endpointsPaginationListItems(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func endpointsPaginationListItems2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
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
                """.utf8
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
        let response = try await client.endpointsPagination.endpointsPaginationListItems(
            cursor: .value("cursor"),
            limit: .value(1),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}