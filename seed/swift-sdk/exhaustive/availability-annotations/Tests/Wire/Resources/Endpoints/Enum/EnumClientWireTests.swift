import Foundation
import Testing
import Exhaustive

@Suite("EnumClient Wire Tests") struct EnumClientWireTests {
    @Test func getAndReturnEnum1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                SUNNY
                """.utf8
            )
        )
        let client = ExhaustiveClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = .sunny
        let response = try await client.endpoints.enum.getAndReturnEnum(
            request: .sunny,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}