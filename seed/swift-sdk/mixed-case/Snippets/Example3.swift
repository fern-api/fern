import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.listresources(
        pageLimit: 1,
        beforeDate: CalendarDate("2023-01-15")!
    )
}

try await main()
