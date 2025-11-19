import Foundation
import Testing
import Api

@Suite("FileUploadExampleClient Wire Tests") struct FileUploadExampleClientWireTests {
    @Test func uploadFile1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.fileUploadExample.uploadFile(
            request: .init(
                file: .init(data: Data("".utf8)),
                name: "name"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}