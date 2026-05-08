import Foundation
import UnionQueryParameters

private func main() async throws {
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

try await main()
