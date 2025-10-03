import Foundation
import Testing
import Errors

@Suite("SimpleClient Wire Tests") struct SimpleClientWireTests {
    @Test func fooWithoutEndpointError1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar"
                }
                """.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "bar"
        )
        let response = try await client.simple.fooWithoutEndpointError(request: FooRequest(
            bar: "bar"
        ))
        try #require(response == expectedResponse)
    }

    @Test func foo1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar"
                }
                """.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "bar"
        )
        let response = try await client.simple.foo(request: FooRequest(
            bar: "bar"
        ))
        try #require(response == expectedResponse)
    }

    @Test func fooWithExamples1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "hello"
                }
                """.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "hello"
        )
        let response = try await client.simple.fooWithExamples(request: FooRequest(
            bar: "hello"
        ))
        try #require(response == expectedResponse)
    }

    @Test func fooWithExamples4() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "bar": "bar"
                }
                """.utf8
            )
        )
        let client = ErrorsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FooResponse(
            bar: "bar"
        )
        let response = try await client.simple.fooWithExamples(request: FooRequest(
            bar: "bar"
        ))
        try #require(response == expectedResponse)
    }
}