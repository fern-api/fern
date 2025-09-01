import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.service.createMovie(request: Movie(
        id: "id",
        prequel: "prequel",
        title: "title",
        from: "from",
        rating: 1.1,
        type: .movie,
        tag: "tag",
        book: "book",
        metadata: [
            "metadata": .object([
                "key": .string("value")
            ])
        ],
        revenue: 1000000
    ))
}

try await main()
