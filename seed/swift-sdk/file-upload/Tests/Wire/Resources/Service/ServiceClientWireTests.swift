import Foundation
import Testing
import FileUpload

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func optionalArgs1() async throws -> Void {
        let stub = HTTPStub()
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
        let response = try await client.service.optionalArgs(
            request: .init(imageFile: .init(data: Data("".utf8))),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func withRefBody1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                Success
                """.utf8
            )
        )
        let client = FileUploadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "Success"
        let response = try await client.service.withRefBody(
            request: .init(
                imageFile: .init(data: Data("".utf8)),
                request: MyObject(
                    foo: "bar"
                )
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}