import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithOptionalField(request: ObjectWithOptionalField(
        string: "string",
        integer: 1,
        long: 1000000,
        double: 1.1,
        bool: true,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        date: CalendarDate("2023-01-15")!,
        uuid: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        base64: "SGVsbG8gd29ybGQh",
        list: [
            "list",
            "list"
        ],
        set: ,
        map: [
            1: "map"
        ],
        bigint: 
    ))
}

try await main()
