import Foundation
import Testing
import Examples

@Suite("FileServiceClient Wire Tests") struct FileServiceClientWireTests {
    @Test func getFileThrowsNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                "A file with that name was not found!"
                """#.utf8
            )
        )
        let client = ExamplesClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.file.service.getFile(
                filename: "file.txt",
                xFileApiVersion: "0.0.2",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected ExamplesError.httpError with status code 404")
        } catch ExamplesError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == "\"A file with that name was not found!\"")
        }
    }
}