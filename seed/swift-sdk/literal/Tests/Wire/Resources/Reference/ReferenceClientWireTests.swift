import Foundation
import Testing
import Literal

@Suite("ReferenceClient Wire Tests") struct ReferenceClientWireTests {
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
        let response = try await client.reference.send(request: SendRequest(
            prompt: .youAreAHelpfulAssistant,
            query: "What is the weather today",
            stream: ,
            context: .youreSuperWise,
            containerObject: ContainerObject(
                nestedObjects: [
                    NestedObjectWithLiterals(
                        literal1: .literal1,
                        literal2: .literal2,
                        strProp: "strProp"
                    )
                ]
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
        let response = try await client.reference.send(request: SendRequest(
            prompt: .youAreAHelpfulAssistant,
            query: "query",
            stream: ,
            ending: .ending,
            context: .youreSuperWise,
            maybeContext: .youreSuperWise,
            containerObject: ContainerObject(
                nestedObjects: [
                    NestedObjectWithLiterals(
                        literal1: .literal1,
                        literal2: .literal2,
                        strProp: "strProp"
                    ),
                    NestedObjectWithLiterals(
                        literal1: .literal1,
                        literal2: .literal2,
                        strProp: "strProp"
                    )
                ]
            )
        ))
        try #require(response == expectedResponse)
    }
}