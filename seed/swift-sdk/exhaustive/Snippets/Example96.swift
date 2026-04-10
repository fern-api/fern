import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsUnion.endpointsUnionGetAndReturnUnion(request: TypesAnimal.typesAnimalZero(
        TypesAnimalZero(
            name: "name",
            likesToWoof: true,
            animal: .dog
        )
    ))
}

try await main()
