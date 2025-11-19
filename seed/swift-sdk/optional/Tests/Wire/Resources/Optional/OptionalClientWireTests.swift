import Foundation
import Testing
import ObjectsWithImports

@Suite("OptionalClient Wire Tests") struct OptionalClientWireTests {
    @Test func sendOptionalBody1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ObjectsWithImportsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.optional.sendOptionalBody(
            request: [
                "string": .object([
                    "key": .string("value")
                ])
            ],
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func sendOptionalTypedBody1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = ObjectsWithImportsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.optional.sendOptionalTypedBody(
            request: SendOptionalBodyRequest(
                message: "message"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func sendOptionalNullableWithAllOptionalProperties1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "success": true
                }
                """.utf8
            )
        )
        let client = ObjectsWithImportsClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = DeployResponse(
            success: true
        )
        let response = try await client.optional.sendOptionalNullableWithAllOptionalProperties(
            actionId: "actionId",
            id: "id",
            request: .value(DeployParams(
                updateDraft: true
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}