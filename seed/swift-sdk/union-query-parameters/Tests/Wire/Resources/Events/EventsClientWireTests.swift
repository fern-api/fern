import Foundation
import Testing
import UnionQueryParameters

@Suite("EventsClient Wire Tests") struct EventsClientWireTests {
    @Test func subscribe1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                string
                """.utf8
            )
        )
        let client = UnionQueryParametersClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = "string"
        let response = try await client.events.subscribe(
            eventType: EventTypeParam.eventTypeEnum(
                .groupCreated
            ),
            tags: StringOrListParam.string(
                "tags"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}