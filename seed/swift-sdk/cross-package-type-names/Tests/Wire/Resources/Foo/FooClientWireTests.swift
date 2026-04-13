import Foundation
import Testing
import Api

@Suite("FooClient Wire Tests") struct FooClientWireTests {
    @Test func find1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "imported": "imported"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ImportingType(
            imported: "imported"
        )
        let response = try await client.foo.find(
            request: .init(),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func find2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "imported": "imported"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = ImportingType(
            imported: "imported"
        )
        let response = try await client.foo.find(
            optionalString: .value(.value("optionalString")),
            request: .init(
                publicProperty: .value("publicProperty"),
                privateProperty: .value(1)
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}