import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.createPlantOrder(
        plantId: "plantId",
        request: .init(body: PlantOrder(
            orderId: "orderId",
            amount: 1.1,
            currency: "currency",
            dateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            plantName: "plantName",
            quantity: 1
        ))
    )
}

try await main()
