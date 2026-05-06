import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.createPlantWithSchema(request: .init(
        name: .value("Sundew"),
        species: .value("Drosera capensis")
    ))
}

try await main()
