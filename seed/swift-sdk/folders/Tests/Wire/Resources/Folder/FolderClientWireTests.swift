import Foundation
import Testing
import Api

@Suite("FolderClient Wire Tests") struct FolderClientWireTests {
    @Test func foo1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.folder.foo(requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers))
    }
}