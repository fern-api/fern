import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsContentType.endpointsContentTypePostJsonPatchContentWithCharsetType(request: TypesObjectWithOptionalField(
        string: .value("string"),
        integer: .value(1),
        long: .value(1000000),
        double: .value(1.1),
        bool: .value(true),
        datetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
        date: .value(CalendarDate("2023-01-15")!),
        uuid: .value("uuid"),
        base64: .value("base64"),
        list: .value([
            "list",
            "list"
        ]),
        set: .value([
            "set",
            "set"
        ]),
        map: .value([
            "map": .value("map")
        ]),
        bigint: .value(1)
    ))
}

try await main()
