import Foundation
import Testing
import Api

@Suite("QueryClient Wire Tests") struct QueryClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "message": "message",
                  "status": 1,
                  "success": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "message",
            status: 1,
            success: true
        )
        let response = try await client.query.send(
            prompt: .youAreAHelpfulAssistant,
            aliasPrompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: true,
            aliasStream: true,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func send2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "message": "message",
                  "status": 1,
                  "success": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "message",
            status: 1,
            success: true
        )
        let response = try await client.query.send(
            prompt: .youAreAHelpfulAssistant,
            optionalPrompt: .value(.youAreAHelpfulAssistant),
            aliasPrompt: .youAreAHelpfulAssistant,
            aliasOptionalPrompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: true,
            optionalStream: .value(true),
            aliasStream: true,
            aliasOptionalStream: true,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}