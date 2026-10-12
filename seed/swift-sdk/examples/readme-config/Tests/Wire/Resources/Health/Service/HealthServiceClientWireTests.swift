import Foundation
import Testing
import Examples

@Suite("HealthServiceClient Wire Tests") struct HealthServiceClientWireTests {
    @Test func check1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.health.service.check(
            id: "id-2sdx82h",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func check2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.health.service.check(
            id: "id-3tey93i",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func ping1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                true
                """#.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = true
        let response = try await client.health.service.ping(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}