import Foundation
import Testing
import MultiUrlEnvironment

@Suite("S3Client Wire Tests") struct S3ClientWireTests {
    @Test func getPresignedUrl1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = MultiUrlEnvironmentClient(
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.s3.getPresignedUrl(request: .init(s3Key: "s3Key"))
        try #require(response == expectedResponse)
    }
}