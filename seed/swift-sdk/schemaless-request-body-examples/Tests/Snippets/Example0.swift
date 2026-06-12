import Foundation
import Api

enum Example0 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.createPlant(request: .object([
            "name": .string("Venus Flytrap"), 
            "species": .string("Dionaea muscipula"), 
            "care": .object([
                "light": .string("full sun"), 
                "water": .string("distilled only"), 
                "humidity": .string("high")
            ]), 
            "tags": .array([
                .string("carnivorous"),
                .string("tropical")
            ])
        ]))
    }
}
