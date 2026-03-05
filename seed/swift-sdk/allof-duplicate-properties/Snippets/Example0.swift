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
            plantName: "plantName"
        ))
    )
}

try await main()
