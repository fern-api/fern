import Foundation
import Testing
import Audiences

@Suite("FolderDServiceClient Wire Tests") struct FolderDServiceClientWireTests {
    @Test func getDirectThread1() async throws -> Void {
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
        let client = AudiencesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ResponseType(
            foo: "foo"
        )
        let response = try await client.folderD.service.getDirectThread(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}