import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithDatetimeLikeString(request: ObjectWithDatetimeLikeString(
        datetimeLikeString: "2023-08-31T14:15:22Z",
        actualDatetime: try! Date("2023-08-31T14:15:22Z", strategy: .iso8601)
    ))
}

try await main()
