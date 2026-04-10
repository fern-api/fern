import Foundation
import Testing
import Api

@Suite("InlinedClient Wire Tests") struct InlinedClientWireTests {
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
        let response = try await client.inlined.send(
            request: .init(
                prompt: .youAreAHelpfulAssistant,
                query: "query",
                stream: true,
                aliasedContext: .youreSuperWise,
                objectWithLiteral: ATopLevelLiteral(
                    nestedLiteral: ANestedLiteral(
                        myLiteral: .howSuperCool
                    )
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
        let response = try await client.inlined.send(
            request: .init(
                prompt: .youAreAHelpfulAssistant,
                context: .value(.youreSuperWise),
                query: "query",
                temperature: .value(1.1),
                stream: true,
                aliasedContext: .youreSuperWise,
                maybeContext: .youreSuperWise,
                objectWithLiteral: ATopLevelLiteral(
                    nestedLiteral: ANestedLiteral(
                        myLiteral: .howSuperCool
                    )
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}