import Foundation
import Testing
import Websocket

@Suite("StatusClient Wire Tests") struct StatusClientWireTests {
    @Test func getStatus1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "status": "status"
                }
                """#.utf8
            )
        )
        let client = WebsocketClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = StatusResponse(
            status: "status"
        )
        let response = try await client.status.getStatus(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}