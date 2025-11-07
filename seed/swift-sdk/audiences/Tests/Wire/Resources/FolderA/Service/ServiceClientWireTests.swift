import Foundation
import Testing
import Audiences

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func getDirectThread1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "foo": {
                    "foo": {
                      "bar_property": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                    }
                  }
                }
                """.utf8
            )
        )
        let client = AudiencesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = Response(
            foo: Optional(Foo(
                foo: Optional(FolderCFoo(
                    barProperty: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!
                ))
            ))
        )
        let response = try await client.folderA.service.getDirectThread(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}