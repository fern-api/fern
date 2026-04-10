import Foundation
import Testing
import Api

@Suite("ReferenceClient Wire Tests") struct ReferenceClientWireTests {
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
        let response = try await client.reference.send(
            request: .init(
                prompt: .youAreAHelpfulAssistant,
                query: "query",
                stream: true,
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
        let response = try await client.reference.send(
            request: .init(
                prompt: .youAreAHelpfulAssistant,
                query: "query",
                stream: true,
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
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}