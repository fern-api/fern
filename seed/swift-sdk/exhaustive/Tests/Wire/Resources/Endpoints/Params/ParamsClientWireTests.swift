import Foundation
import Testing
import Exhaustive

@Suite("ParamsClient Wire Tests") struct ParamsClientWireTests {
    @Test func getWithPath1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.endpoints.params.getWithPath(param: "param")
        try #require(response == expectedResponse)
    }

    @Test func getWithInlinePath1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.endpoints.params.getWithInlinePath(param: "param")
        try #require(response == expectedResponse)
    }

    @Test func modifyWithPath1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.endpoints.params.modifyWithPath(
            param: "param",
            request: "string"
        )
        try #require(response == expectedResponse)
    }

    @Test func modifyWithInlinePath1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.endpoints.params.modifyWithInlinePath(
            param: "param",
            request: .init(body: "string")
        )
        try #require(response == expectedResponse)
    }
}