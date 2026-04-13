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
    request := &fern.ComplexProfile{
        ID: "id",
        NullableRole: fern.UserRoleAdmin,
        NullableStatus: fern.UserStatusActive,
        NullableNotification: &fern.NotificationMethod{
            NotificationMethodZero: &fern.NotificationMethodZero{
                EmailAddress: "emailAddress",
                Subject: "subject",
                Type: fern.NotificationMethodZeroTypeEmail,
            },
        },
        NullableSearchResult: &fern.SearchResult{
            SearchResultZero: &fern.SearchResultZero{
                ID: "id",
                Username: "username",
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                Type: fern.SearchResultZeroTypeUser,
            },
        },
    }
    client.Nullableoptional.Createcomplexprofile(
        context.TODO(),
        request,
    )
}
