import Foundation
import Testing
import Api

@Suite("MessagesMessagesClient Wire Tests") struct MessagesMessagesClientWireTests {
    @Test func listMessages1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                [
                  {
                    "sid": "sid",
                    "body": "body"
                  }
                ]
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Message(
                sid: "sid",
                body: "body"
            )
        ]
        let response = try await client.messages.messages.listMessages(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func listMessages2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                [
                  {
                    "sid": "sid",
                    "body": "body"
                  },
                  {
                    "sid": "sid",
                    "body": "body"
                  }
                ]
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Message(
                sid: "sid",
                body: "body"
            ),
            Message(
                sid: "sid",
                body: "body"
            )
        ]
        let response = try await client.messages.messages.listMessages(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func createMessage1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "sid": "sid",
                  "body": "body"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Message(
            sid: "sid",
            body: "body"
        )
        let response = try await client.messages.messages.createMessage(
            request: Message(
                sid: "sid",
                body: "body"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createMessage2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "sid": "sid",
                  "body": "body"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Message(
            sid: "sid",
            body: "body"
        )
        let response = try await client.messages.messages.createMessage(
            request: Message(
                sid: "sid",
                body: "body"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}