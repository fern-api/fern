import Foundation
import NullableOptional

private func main() async throws {
    let client = NullableOptionalClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableOptional.testDeserialization(request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: .value("nullableString"),
        optionalString: "optionalString",
        optionalNullableString: .value("optionalNullableString"),
        nullableEnum: .value(.admin),
        optionalEnum: .active,
        nullableUnion: .value(NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        )),
        optionalUnion: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: .value("email"),
                phone: "phone",
                createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                address: Address(
                    street: "street",
                    city: .value("city"),
                    state: "state",
                    zipCode: "zipCode",
                    country: .value("country"),
                    buildingId: .value("buildingId"),
                    tenantId: "tenantId"
                )
            )
        ),
        nullableList: .value([
            "nullableList",
            "nullableList"
        ]),
        nullableMap: .value([
            "nullableMap": 1
        ]),
        nullableObject: .value(Address(
            street: "street",
            city: .value("city"),
            state: "state",
            zipCode: "zipCode",
            country: .value("country"),
            buildingId: .value("buildingId"),
            tenantId: "tenantId"
        )),
        optionalObject: Organization(
            id: "id",
            name: "name",
            domain: .value("domain"),
            employeeCount: 1
        )
    ))
}

try await main()
