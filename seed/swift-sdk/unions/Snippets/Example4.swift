import Unions

let client = SeedUnionsClient()

try await client.union.update(
    request: Shape.circle(
        .init(
            id: "id",
            radius: 1.1
        )
    )
)
