import NullableOptional

let client = SeedNullableOptionalClient()

try await client.nullableOptional.updateComplexProfile(
    profileId: "profileId",
    request: .init(
        profileId: "profileId",
        nullableRole: .admin,
        nullableStatus: .active,
        nullableNotification: NotificationMethod.email(
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
        nullableArray: [
            "nullableArray",
            "nullableArray"
        ]
    )
)
