import Foundation
import Testing
import Literal

@Suite("QueryClient Wire Tests") struct QueryClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "message": "The weather is sunny",
                  "status": 200,
                  "success": true
                }
                """.utf8
            )
        )
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "The weather is sunny",
            status: 200
        )
        let response = try await client.query.send(
            prompt: .youAreAHelpfulAssistant,
            optionalPrompt: .youAreAHelpfulAssistant,
            aliasPrompt: .youAreAHelpfulAssistant,
            aliasOptionalPrompt: .youAreAHelpfulAssistant,
            query: "What is the weather today",
            stream: ,
            optionalStream: ,
            aliasStream: ,
            aliasOptionalStream: 
        )
        try #require(response == expectedResponse)
    }

    @Test func send2() async throws -> Void {
        let stub = WireStub()
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
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "message",
            status: 1
        )
        let response = try await client.query.send(
            prompt: .youAreAHelpfulAssistant,
            optionalPrompt: .youAreAHelpfulAssistant,
            aliasPrompt: .youAreAHelpfulAssistant,
            aliasOptionalPrompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: ,
            optionalStream: ,
            aliasStream: ,
            aliasOptionalStream: 
        )
        try #require(response == expectedResponse)
    }
}