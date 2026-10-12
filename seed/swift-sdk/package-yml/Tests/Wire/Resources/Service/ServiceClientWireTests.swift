import Foundation
import Testing
import PackageYml

@Suite("ServiceClient Wire Tests") struct ServiceClientWireTests {
    @Test func nop1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = PackageYmlClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        try await client.service.nop(
            id: "id-a2ijs82",
            nestedId: "id-219xca8",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}