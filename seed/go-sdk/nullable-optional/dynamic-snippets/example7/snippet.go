package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    fern "github.com/nullable-optional/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UpdateComplexProfileRequest{
        NullableRole: fern.UserRoleAdmin.Ptr(),
        NullableStatus: fern.UserStatusActive.Ptr(),
        NullableNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        NullableSearchResult: &fern.SearchResult{
            User: &fern.UserResponse{
                Id: "id",
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
                    BuildingId: fern.String(
                        "buildingId",
                    ),
                    TenantId: fern.String(
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
    client.NullableOptional.UpdateComplexProfile(
        context.TODO(),
        "profileId",
        request,
    )
}
