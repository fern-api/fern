import Foundation
import Testing
import Api

@Suite("WidgetsClient Wire Tests") struct WidgetsClientWireTests {
    @Test func create1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "name": "name"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Widget(
            name: "name"
        )
        let response = try await client.widgets.create(
            apiVersion: "v1beta",
            request: Widget(
                name: "name"
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}