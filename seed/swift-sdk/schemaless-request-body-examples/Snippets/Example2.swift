import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.updatePlant(
        plantId: "plantId",
        request: .init(body: .object([
            "name": .string("Updated Venus Flytrap"), 
            "care": .object([
                "light": .string("partial shade")
            ])
        ]))
    )
}

try await main()
