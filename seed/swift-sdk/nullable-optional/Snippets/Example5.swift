import NullableOptional

private func main() async throws {
    let client = SeedNullableOptionalClient()

    try await client.nullableOptional.createComplexProfile(request: ComplexProfile(
        id: "id",
        nullableRole: .admin,
        optionalRole: .admin,
        optionalNullableRole: .admin,
        nullableStatus: .active,
        optionalStatus: .active,
        optionalNullableStatus: .active,
        nullableNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        optionalNullableNotification: NotificationMethod.email(
            .init(
                emailAddress: "emailAddress",
                subject: "subject",
                htmlContent: "htmlContent"
            )
        ),
        nullableSearchResult: SearchResult.user(
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
        optionalSearchResult: SearchResult.user(
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
        nullableArray: [
            "nullableArray",
            "nullableArray"
        ],
        optionalArray: [
            "optionalArray",
            "optionalArray"
        ],
        optionalNullableArray: [
            "optionalNullableArray",
            "optionalNullableArray"
        ],
        nullableListOfNullables: [
            "nullableListOfNullables",
            "nullableListOfNullables"
        ],
        nullableMapOfNullables: [
            "nullableMapOfNullables": Address(
                street: "street",
                city: "city",
                state: "state",
                zipCode: "zipCode",
                country: "country",
                buildingId: "buildingId",
                tenantId: "tenantId"
            )
        ],
        nullableListOfUnions: [
            NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            ),
            NotificationMethod.email(
                .init(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: "htmlContent"
                )
            )
        ],
        optionalMapOfEnums: [
            "optionalMapOfEnums": .admin
        ]
    ))
}

try await main()
