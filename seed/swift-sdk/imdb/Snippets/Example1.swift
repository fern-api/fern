import Foundation
import Api

private func main() async throws {
    let client = SeedApiClient(token: "<token>")

    try await client.imdb.getMovie(movieId: "movieId")
}

try await main()
