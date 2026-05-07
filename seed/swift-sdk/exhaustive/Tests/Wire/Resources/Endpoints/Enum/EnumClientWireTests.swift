import Foundation
import Testing
import Api

@Suite("EnumClient Wire Tests") struct EnumClientWireTests {
    @Test func getAndReturnEnum1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                SUNNY
                """#.utf8
            )
        )
        let client = ApiClient(
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

    @Test func getAndReturnEnum2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                #"""
                SUNNY
                """#.utf8
            )
        )
        let client = ApiClient(
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