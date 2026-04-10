package example

import (
    context "context"

    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.NullableOptionalUpdateComplexProfileRequest{
        ProfileID: "profileId",
        NullableRole: fern.UserRoleAdmin.Ptr(),
        NullableStatus: fern.UserStatusActive.Ptr(),
        NullableNotification: &fern.NotificationMethod{
            NotificationMethodZero: &fern.NotificationMethodZero{
                Type: fern.NotificationMethodZeroTypeEmail,
                EmailAddress: "emailAddress",
                Subject: "subject",
                HTMLContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        NullableSearchResult: &fern.SearchResult{
            SearchResultZero: &fern.SearchResultZero{
                Type: fern.SearchResultZeroTypeUser,
                ID: "id",
                Username: "username",
                Email: fern.String(
                    "email",
                ),
                Phone: fern.String(
                    "phone",
                ),
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.Time(
                    fern.MustParseDateTime(
                        "2024-01-15T09:30:00Z",
                    ),
                ),
                Address: &fern.Address{
                    Street: "street",
                    City: fern.String(
                        "city",
                    ),
                    State: fern.String(
                        "state",
                    ),
                    ZipCode: "zipCode",
                    Country: fern.String(
                        "country",
                    ),
                    BuildingID: fern.String(
                        "buildingId",
                    ),
                    TenantID: fern.String(
                        "tenantId",
                    ),
                },
            },
        },
        NullableArray: []string{
            "nullableArray",
            "nullableArray",
        },
    }
    client.Nullableoptional.Updatecomplexprofile(
        context.TODO(),
        request,
    )
}
