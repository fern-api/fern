import Foundation
import Api

enum Example11 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createPlant(request: .init(
            commonName: "commonName",
            wateringFrequency: .daily,
            species: "species",
            family: "family",
            genus: "genus",
            sunExposure: .full,
            plantedAt: CalendarDate("2023-01-15")!,
            soilType: "soilType"
        ))
    }
}
