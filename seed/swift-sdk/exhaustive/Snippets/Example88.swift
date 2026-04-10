import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnDate(request: CalendarDate("2023-01-15")!)
}

try await main()
