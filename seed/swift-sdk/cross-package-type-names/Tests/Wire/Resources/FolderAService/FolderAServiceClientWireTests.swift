import Foundation
import Testing
import Api

@Suite("FolderAServiceClient Wire Tests") struct FolderAServiceClientWireTests {
    @Test func folderAServiceGetDirectThread1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "foo": {
                    "foo": {
                      "bar_property": "bar_property"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FolderAResponse(
            foo: Optional(FolderBFoo(
                foo: Optional(FolderCFoo(
                    barProperty: "bar_property"
                ))
            ))
        )
        let response = try await client.folderAService.folderAServiceGetDirectThread(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func folderAServiceGetDirectThread2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "foo": {
                    "foo": {
                      "bar_property": "bar_property"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FolderAResponse(
            foo: Optional(FolderBFoo(
                foo: Optional(FolderCFoo(
                    barProperty: "bar_property"
                ))
            ))
        )
        let response = try await client.folderAService.folderAServiceGetDirectThread(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}