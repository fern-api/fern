import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsObject.endpointsObjectGetAndReturnWithDatetimeLikeString(request: TypesObjectWithDatetimeLikeString(
        datetimeLikeString: "datetimeLikeString",
        actualDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)
    ))
}

try await main()
