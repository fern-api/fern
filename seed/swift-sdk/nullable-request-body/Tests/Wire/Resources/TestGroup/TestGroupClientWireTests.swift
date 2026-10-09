import Foundation
import Testing
import Api

@Suite("TestGroupClient Wire Tests") struct TestGroupClientWireTests {
    @Test func testMethodName1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "key": "value"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = JSONValue.object(
            [
                "key": JSONValue.string("value")
            ]
        )
        let response = try await client.testGroup.testMethodName(
            pathParam: "path_param",
            request: .value(PlainObject(

            )),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func testMethodNameThrowsUnprocessableEntityError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 422,
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "name": "name"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.testGroup.testMethodName(
                pathParam: "path_param",
                queryParamObject: .value(PlainObject(
                    id: "id",
                    name: "name"
                )),
                queryParamInteger: .value(1),
                request: .value(PlainObject(
                    id: "id",
                    name: "name"
                )),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ApiError.httpError with status code 422")
        } catch ApiError.httpError(let httpError) {
            #expect(httpError.statusCode == 422)
            let body = try #require(httpError.body)
            #expect(body.code == 422)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "id": "id",
              "name": "name"
            }
            """#)
        }
    }
}