import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.testdeserialization(request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: .null,
        nullableEnum: .admin,
        nullableUnion: NotificationMethod.notificationMethodZero(
            NotificationMethodZero(
                emailAddress: "emailAddress",
                subject: "subject",
                type: .email
            )
        ),
        nullableList: .null,
        nullableMap: .null,
        nullableObject: Address(
            street: "street",
            city: .null,
            zipCode: "zipCode",
            buildingId: .null,
            tenantId: .null
        )
    ))
}

try await main()
