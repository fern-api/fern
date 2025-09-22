import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.service.createMovie(request: Movie(
        id: "movie-c06a4ad7",
        prequel: "movie-cv9b914f",
        title: "The Boy and the Heron",
        from: "Hayao Miyazaki",
        rating: 8,
        type: .movie,
        tag: "tag-wf9as23d",
        metadata: [
            "actors": .array([
                .string("Christian Bale"),
                .string("Florence Pugh"),
                .string("Willem Dafoe")
            ]), 
            "releaseDate": .string("2023-12-08"), 
            "ratings": .object([
                "rottenTomatoes": .number(97), 
                "imdb": .number(7.6)
            ])
        ],
        revenue: 1000000
    ))
}

try await main()
