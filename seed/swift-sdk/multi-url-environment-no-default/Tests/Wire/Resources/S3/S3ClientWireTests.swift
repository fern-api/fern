import Foundation
import Testing
import MultiUrlEnvironmentNoDefault

@Suite("S3Client Wire Tests") struct S3ClientWireTests {
    @Test func getPresignedUrl1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = MultiUrlEnvironmentNoDefaultClient(
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.s3.getPresignedUrl(
            request: .init(s3Key: "s3Key"),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}