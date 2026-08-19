import Foundation
import Api

enum Example10 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createPlant(request: .init(
            species: "species",
            family: "family",
            genus: "genus",
            commonName: "commonName",
            wateringFrequency: .daily,
            sunExposure: .full
        ))
    }
}
