import Foundation
import Testing
import Examples

@Suite("FileServiceClient Wire Tests") struct FileServiceClientWireTests {
    @Test func getFile2() async throws -> Void {
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
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = File(
            name: "name",
            contents: "contents"
        )
        let response = try await client.file.service.getFile(
            filename: "filename",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}