import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.endpoints.union.getAndReturnUnion(
        request: Animal.dog(
            .init(
                name: "name",
                likesToWoof: True
            )
        )
    )
}

try await main()
