import Foundation
import Api

enum Example3 {
    static func snippet() async throws {
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.imdb.getMovie(movieId: "movieId")
    }
}
