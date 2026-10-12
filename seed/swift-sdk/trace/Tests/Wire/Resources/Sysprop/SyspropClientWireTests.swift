import Foundation
import Testing
import Trace

@Suite("SyspropClient Wire Tests") struct SyspropClientWireTests {
    @Test func setNumWarmInstances1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.sysprop.setNumWarmInstances(
            language: "JAVA",
            numWarmInstances: "1",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func getNumWarmInstances1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "JAVA": 1
                }
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Language.java: 1
        ]
        let response = try await client.sysprop.getNumWarmInstances(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}