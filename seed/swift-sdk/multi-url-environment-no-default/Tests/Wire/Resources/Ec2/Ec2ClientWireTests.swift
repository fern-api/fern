import Foundation
import Testing
import MultiUrlEnvironmentNoDefault

@Suite("Ec2Client Wire Tests") struct Ec2ClientWireTests {
    @Test func bootInstance1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = MultiUrlEnvironmentNoDefaultClient(
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.ec2.bootInstance(
            request: .init(size: "size"),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}