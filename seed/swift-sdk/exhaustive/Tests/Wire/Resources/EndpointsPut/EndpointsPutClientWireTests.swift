import Foundation
import Testing
import Api

@Suite("EndpointsPutClient Wire Tests") struct EndpointsPutClientWireTests {
    @Test func endpointsPutAdd1() async throws -> Void {
        let stub = HTTPStub()
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
                    }
                  ]
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = EndpointsPutResponse(
            errors: Optional(Nullable<[EndpointsError]>.value([
                EndpointsError(
                    category: .apiError,
                    code: .internalServerError,
                    detail: Optional(Nullable<String>.value("detail")),
                    field: Optional(Nullable<String>.value("field"))
                )
            ]))
        )
        let response = try await client.endpointsPut.endpointsPutAdd(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsPutAdd2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = EndpointsPutResponse(
            errors: Optional(Nullable<[EndpointsError]>.value([
                EndpointsError(
                    category: .apiError,
                    code: .internalServerError,
                    detail: Optional(Nullable<String>.value("detail")),
                    field: Optional(Nullable<String>.value("field"))
                ),
                EndpointsError(
                    category: .apiError,
                    code: .internalServerError,
                    detail: Optional(Nullable<String>.value("detail")),
                    field: Optional(Nullable<String>.value("field"))
                )
            ]))
        )
        let response = try await client.endpointsPut.endpointsPutAdd(
            id: "id",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}