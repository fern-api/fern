import Foundation
import Testing
import FileUpload

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func optionalArgs1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                Foo
                """.utf8
            )
        )
        let client = FileUploadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "Foo"
        let response = try await client.service.optionalArgs(request: .init(
            imageFile: .init(data: Data("".utf8)),
            request: 
        ))
        try #require(response == expectedResponse)
    }
}