import Foundation
import Testing
import Api

@Suite("TestgroupClient Wire Tests") struct TestgroupClientWireTests {
    @Test func testMethodName1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
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
        let response = try await client.testgroup.testMethodName(
            pathParam: "path_param",
            request: .value(PlainObject(

            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func testMethodName2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
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
        let response = try await client.testgroup.testMethodName(
            pathParam: "path_param",
            queryParamObject: .value(PlainObject(
                id: .value("id"),
                name: .value("name")
            )),
            queryParamInteger: .value(1),
            request: .value(PlainObject(
                id: .value("id"),
                name: .value("name")
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}