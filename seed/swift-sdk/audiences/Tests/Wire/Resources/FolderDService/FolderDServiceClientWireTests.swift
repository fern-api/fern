import Foundation
import Testing
import Api

@Suite("FolderDServiceClient Wire Tests") struct FolderDServiceClientWireTests {
    @Test func folderDServiceGetDirectThread1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "foo": "foo"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FolderDResponse(
            foo: "foo"
        )
        let response = try await client.folderDService.folderDServiceGetDirectThread(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func folderDServiceGetDirectThread2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "foo": "foo"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = FolderDResponse(
            foo: "foo"
        )
        let response = try await client.folderDService.folderDServiceGetDirectThread(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}