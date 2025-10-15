import Foundation
import Testing
import CrossPackageTypeNames

@Suite("FolderDServiceClient Wire Tests") struct FolderDServiceClientWireTests {
    @Test func getDirectThread1() async throws -> Void {
        let stub = WireStub()
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
        let client = CrossPackageTypeNamesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ResponseType(
            foo: Optional(Foo(
                foo: Optional(FooType(
                    barProperty: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!
                ))
            ))
        )
        let response = try await client.folderD.service.getDirectThread()
        try #require(response == expectedResponse)
    }
}