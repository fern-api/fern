import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.imdb.createMovie(request: CreateMovieRequest(
        title: "title",
        rating: 1.1
    ))
}

try await main()
