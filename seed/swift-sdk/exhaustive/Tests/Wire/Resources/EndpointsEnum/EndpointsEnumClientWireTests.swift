import Foundation
import Testing
import Api

@Suite("EndpointsEnumClient Wire Tests") struct EndpointsEnumClientWireTests {
    @Test func endpointsEnumGetAndReturnEnum1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                SUNNY
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = .sunny
        let response = try await client.endpointsEnum.endpointsEnumGetAndReturnEnum(
            request: .sunny,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func endpointsEnumGetAndReturnEnum2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                SUNNY
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = .sunny
        let response = try await client.endpointsEnum.endpointsEnumGetAndReturnEnum(
            request: .sunny,
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}