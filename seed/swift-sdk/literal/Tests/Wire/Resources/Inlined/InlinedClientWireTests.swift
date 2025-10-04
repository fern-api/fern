import Foundation
import Testing
import Literal

@Suite("InlinedClient Wire Tests") struct InlinedClientWireTests {
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
            status: 200,
            success: 
        )
        let response = try await client.inlined.send(request: .init(
            prompt: .youAreAHelpfulAssistant,
            context: .youreSuperWise,
            query: "What is the weather today",
            temperature: 10.1,
            stream: ,
            aliasedContext: .youreSuperWise,
            maybeContext: .youreSuperWise,
            objectWithLiteral: ATopLevelLiteral(
                nestedLiteral: ANestedLiteral(
                    myLiteral: .howSuperCool
                )
            )
        ))
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
            status: 1,
            success: 
        )
        let response = try await client.inlined.send(request: .init(
            prompt: .youAreAHelpfulAssistant,
            context: .youreSuperWise,
            query: "query",
            temperature: 1.1,
            stream: ,
            aliasedContext: .youreSuperWise,
            maybeContext: .youreSuperWise,
            objectWithLiteral: ATopLevelLiteral(
                nestedLiteral: ANestedLiteral(
                    myLiteral: .howSuperCool
                )
            )
        ))
        try #require(response == expectedResponse)
    }
}