import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.regularpatch(
        id: "id",
        request: .init(
            field1: .value("field1"),
            field2: .value(1)
        )
    )
}

try await main()
