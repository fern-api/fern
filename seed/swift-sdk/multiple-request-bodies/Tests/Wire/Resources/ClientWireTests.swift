import Foundation
import Testing
import Api

@Suite("Client Wire Tests") struct ClientWireTests {
    @Test func uploadJsonDocument1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "author": "author",
                  "id": 1,
                  "tags": [
                    {
                      "key": "value"
                    }
                  ],
                  "title": "title"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UploadDocumentResponse.documentMetadata(
            DocumentMetadata(
                author: Optional(Nullable<String>.value("author")),
                id: Optional(Nullable<Int>.value(1)),
                tags: Optional(Nullable<[JSONValue]>.value([
                    JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])),
                title: Optional(Nullable<String>.value("title"))
            )
        )
        let response = try await client..uploadJsonDocument(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func uploadJsonDocument2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "author": "author",
                  "id": 1,
                  "tags": [
                    {
                      "key": "value"
                    },
                    {
                      "key": "value"
                    }
                  ],
                  "title": "title"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = UploadDocumentResponse.documentMetadata(
            DocumentMetadata(
                author: Optional(Nullable<String>.value("author")),
                id: Optional(Nullable<Int>.value(1)),
                tags: Optional(Nullable<[JSONValue]>.value([
                    JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    ),
                    JSONValue.object(
                        [
                            "key": JSONValue.string("value")
                        ]
                    )
                ])),
                title: Optional(Nullable<String>.value("title"))
            )
        )
        let response = try await client..uploadJsonDocument(
            request: .init(
                author: .value("author"),
                tags: .value([
                    "tags",
                    "tags"
                ]),
                title: .value("title")
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}