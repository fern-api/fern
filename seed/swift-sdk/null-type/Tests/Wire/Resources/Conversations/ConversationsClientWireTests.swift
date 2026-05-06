import Foundation
import Testing
import Api

@Suite("ConversationsClient Wire Tests") struct ConversationsClientWireTests {
    @Test func outboundcall1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "conversation_id": {
                    "key": "value"
                  },
                  "dry_run": true
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = OutboundCallConversationsResponse(
            conversationId: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ),
            dryRun: true
        )
        let response = try await client.conversations.outboundcall(
            request: .init(toPhoneNumber: "to_phone_number"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func outboundcall2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                {
                  "conversation_id": {
                    "key": "value"
                  },
                  "dry_run": true
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = OutboundCallConversationsResponse(
            conversationId: JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            ),
            dryRun: true
        )
        let response = try await client.conversations.outboundcall(
            request: .init(
                toPhoneNumber: "to_phone_number",
                dryRun: .value(true)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}