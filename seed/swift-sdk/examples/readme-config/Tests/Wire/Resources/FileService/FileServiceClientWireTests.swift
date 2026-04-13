import Foundation
import Testing
import Api

@Suite("FileServiceClient Wire Tests") struct FileServiceClientWireTests {
    @Test func fileServiceGetFile1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "contents": "contents"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = File(
            name: "name",
            contents: "contents"
        )
        let response = try await client.fileService.fileServiceGetFile(
            filename: "filename",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func fileServiceGetFile2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "contents": "contents"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = File(
            name: "name",
            contents: "contents"
        )
        let response = try await client.fileService.fileServiceGetFile(
            filename: "filename",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}