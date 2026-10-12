import Foundation
import Testing
import Literal

@Suite("ReferenceClient Wire Tests") struct ReferenceClientWireTests {
    @Test func send1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "message": "The weather is sunny",
                  "status": 200,
                  "success": true
                }
                """#.utf8
            )
        )
        let client = LiteralClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = SendResponse(
            message: "The weather is sunny",
            status: 200,
            success: true
        )
        let response = try await client.reference.send(
            request: SendRequest(
                prompt: .youAreAHelpfulAssistant,
                query: "What is the weather today",
                stream: false,
                ending: .ending,
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
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}