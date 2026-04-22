import Foundation
import Testing
import Trace

@Suite("SyspropClient Wire Tests") struct SyspropClientWireTests {
    @Test func getNumWarmInstances1() async throws -> Void {
        let stub = HTTPStub()
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
        let response = try await client.sysprop.getNumWarmInstances(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}