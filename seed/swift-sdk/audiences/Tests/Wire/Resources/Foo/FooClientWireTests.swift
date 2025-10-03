import Foundation
import Testing
import Audiences

@Suite("FooClient Wire Tests") struct FooClientWireTests {
    @Test func find1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "imported": "imported"
                }
                """.utf8
            )
        )
        let client = AudiencesClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ImportingType(
            imported: "imported"
        )
        let response = try await client.foo.find(
            optionalString: "optionalString",
            request: .init(
                publicProperty: "publicProperty",
                privateProperty: 1
            )
        )
        try #require(response == expectedResponse)
    }
}