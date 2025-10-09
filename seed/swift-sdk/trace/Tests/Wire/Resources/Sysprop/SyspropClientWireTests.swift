import Foundation
import Testing
import Trace

@Suite("SyspropClient Wire Tests") struct SyspropClientWireTests {
    @Test func getNumWarmInstances1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "JAVA": 1
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            .java: 1
        ]
        let response = try await client.sysprop.getNumWarmInstances()
        try #require(response == expectedResponse)
    }
}