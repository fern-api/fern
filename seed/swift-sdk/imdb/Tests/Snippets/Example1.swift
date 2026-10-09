import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.imdb.createMovie(request: .init(
            title: "title",
            rating: 1.1
        ))
    }
}
