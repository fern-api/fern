import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.updatePlant(
        plantId: "plantId",
        request: .object([
            "key": .string("value")
        ])
    )
}

try await main()
