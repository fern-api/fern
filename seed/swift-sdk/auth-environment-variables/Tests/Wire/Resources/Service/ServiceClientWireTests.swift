import Foundation
import Testing
import AuthEnvironmentVariables

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getWithApiKey1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = AuthEnvironmentVariablesClient(
            baseURL: "https://api.fern.com",
            apiKey: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getWithApiKey(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getWithHeader1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = AuthEnvironmentVariablesClient(
            baseURL: "https://api.fern.com",
            apiKey: "<value>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.service.getWithHeader(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}