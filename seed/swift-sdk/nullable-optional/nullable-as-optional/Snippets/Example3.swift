import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.updateuser(
        userId: "userId",
        request: .init(
            username: .value("username"),
            email: .value("email"),
            phone: .value("phone"),
            address: Address(
                street: "street",
                city: .value("city"),
                state: .value("state"),
                zipCode: "zipCode",
                country: .value("country"),
                buildingId: .value(.value("buildingId")),
                tenantId: .value(.value("tenantId"))
            )
        )
    )
}

try await main()
