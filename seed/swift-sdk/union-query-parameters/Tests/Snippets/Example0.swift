import Foundation
import UnionQueryParameters

enum Example0 {
    static func snippet() async throws {
        let client = UnionQueryParametersClient(baseURL: "https://api.fern.com")

        _ = try await client.events.subscribe(
            eventType: EventTypeParam.eventTypeEnum(
                .groupCreated
            ),
            tags: StringOrListParam.string(
                "tags"
            )
        )
    }
}
