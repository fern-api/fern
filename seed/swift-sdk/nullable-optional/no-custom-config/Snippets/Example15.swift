import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.nullableoptional.updatecomplexprofile(
        profileId: "profileId",
        request: .init(
            nullableRole: .admin,
            nullableStatus: .active,
            nullableNotification: NotificationMethod.notificationMethodZero(
                NotificationMethodZero(
                    emailAddress: "emailAddress",
                    subject: "subject",
                    htmlContent: .value("htmlContent"),
                    type: .email
                )
            ),
            nullableSearchResult: SearchResult.searchResultZero(
                SearchResultZero(
                    id: "id",
                    username: "username",
                    email: .value("email"),
                    phone: .value("phone"),
                    createdAt: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                    updatedAt: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
                    address: Address(
                        street: "street",
                        city: .value("city"),
                        state: .value("state"),
                        zipCode: "zipCode",
                        country: .value("country"),
                        buildingId: .value(.value("buildingId")),
                        tenantId: .value(.value("tenantId"))
                    ),
                    type: .user
                )
            ),
            nullableArray: .value([
                "nullableArray",
                "nullableArray"
            ])
        )
    )
}

try await main()
