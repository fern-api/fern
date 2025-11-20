import Foundation
import Testing
import Api

@Suite("TestGroupClient Wire Tests") struct TestGroupClientWireTests {
    @Test func testMethodName1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": "value"
                }
                """.utf8
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
            request: .init(body: .value(PlainObject(

            ))),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func testMethodName2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "key": "value"
                }
                """.utf8
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
            queryParamObject: .value(PlainObject(
                id: "id",
                name: "name"
            )),
            queryParamInteger: .value(1),
            request: .init(body: .value(PlainObject(
                id: "id",
                name: "name"
            ))),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}