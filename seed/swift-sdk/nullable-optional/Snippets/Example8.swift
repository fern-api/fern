import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.testDeserialization(
    request: DeserializationTestRequest(
        requiredString: "requiredString",
        nullableString: "nullableString",
        optionalString: "optionalString",
        optionalNullableString: "optionalNullableString",
        nullableEnum: .admin,
        optionalEnum: .active,
        nullableUnion: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalUnion: SearchResult.user(
            .init(
                id: "id",
                username: "username",
                email: "email",
                phone: "phone",
                createdAt: Date(timeIntervalSince1970: 1705311000),
                updatedAt: Date(timeIntervalSince1970: 1705311000),
                address: Address(
                    street: "street",
                    city: "city",
                    state: "state",
                    zipCode: "zipCode",
                    country: "country",
                    buildingId: "buildingId",
                    tenantId: "tenantId"
                )
            )
        ),
        nullableList: [
            "nullableList",
            "nullableList"
        ],
        nullableMap: [
            "nullableMap": 1
        ],
        nullableObject: Address(
            street: "street",
            city: "city",
            state: "state",
            zipCode: "zipCode",
            country: "country",
            buildingId: "buildingId",
            tenantId: "tenantId"
        ),
        optionalObject: Organization(
            id: "id",
            name: "name",
            domain: "domain",
            employeeCount: 1
        )
    )
)
