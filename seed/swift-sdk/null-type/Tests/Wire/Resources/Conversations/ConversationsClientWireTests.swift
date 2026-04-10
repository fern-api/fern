import Foundation
import Testing
import Api

@Suite("ConversationsClient Wire Tests") struct ConversationsClientWireTests {
    @Test func outboundCall1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "conversation_id": {
                    "key": "value"
                  },
                  "dry_run": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = OutboundCallConversationsResponse(
            conversationId: Nullable<JSONValue>.value(JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )),
            dryRun: true
        )
        let response = try await client.conversations.outboundCall(
            request: .init(toPhoneNumber: "to_phone_number"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func outboundCall2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "conversation_id": {
                    "key": "value"
                  },
                  "dry_run": true
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = OutboundCallConversationsResponse(
            conversationId: Nullable<JSONValue>.value(JSONValue.object(
                [
                    "key": JSONValue.string("value")
                ]
            )),
            dryRun: true
        )
        let response = try await client.conversations.outboundCall(
            request: .init(
                toPhoneNumber: "to_phone_number",
                dryRun: true
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}