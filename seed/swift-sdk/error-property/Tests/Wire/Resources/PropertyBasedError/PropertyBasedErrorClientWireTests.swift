import Foundation
import Testing
import ErrorProperty

@Suite("PropertyBasedErrorClient Wire Tests") struct PropertyBasedErrorClientWireTests {
    @Test func throwError1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ErrorPropertyClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.propertyBasedError.throwError()
        try #require(response == expectedResponse)
    }
}