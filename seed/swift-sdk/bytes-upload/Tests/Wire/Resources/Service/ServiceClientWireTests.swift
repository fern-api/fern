import Foundation
import Testing
import BytesUpload

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func upload1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = BytesUploadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.upload(
            request: Data("data".utf8),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func uploadWithQueryParams1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = BytesUploadClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.uploadWithQueryParams(
            model: "nova-2",
            request: Data("data".utf8),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}