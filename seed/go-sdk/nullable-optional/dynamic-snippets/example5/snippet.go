package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    context "context"
    fern "github.com/nullable-optional/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.NullableOptional.CreateComplexProfile(
        context.TODO(),
        &fern.ComplexProfile{
            Id: "id",
            NullableRole: fern.UserRoleAdmin.Ptr(),
            OptionalRole: fern.UserRoleAdmin.Ptr(),
            OptionalNullableRole: fern.UserRoleAdmin.Ptr(),
            NullableStatus: fern.UserStatusActive.Ptr(),
            OptionalStatus: fern.UserStatusActive.Ptr(),
            OptionalNullableStatus: fern.UserStatusActive.Ptr(),
            NullableNotification: &fern.NotificationMethod{
                Email: &fern.EmailNotification{
                    EmailAddress: "emailAddress",
                    Subject: "subject",
                    HtmlContent: fern.String(
                        "htmlContent",
                    ),
                },
            },
            OptionalNotification: &fern.NotificationMethod{
                Email: &fern.EmailNotification{
                    EmailAddress: "emailAddress",
                    Subject: "subject",
                    HtmlContent: fern.String(
                        "htmlContent",
                    ),
                },
            },
            OptionalNullableNotification: &fern.NotificationMethod{
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
            OptionalSearchResult: &fern.SearchResult{
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
            OptionalArray: []string{
                "optionalArray",
                "optionalArray",
            },
            OptionalNullableArray: []string{
                "optionalNullableArray",
                "optionalNullableArray",
            },
            NullableListOfNullables: []*string{
                fern.String(
                    "nullableListOfNullables",
                ),
                fern.String(
                    "nullableListOfNullables",
                ),
            },
            NullableMapOfNullables: map[string]*fern.Address{
                "nullableMapOfNullables": &fern.Address{
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
            NullableListOfUnions: []*fern.NotificationMethod{
                &fern.NotificationMethod{
                    Email: &fern.EmailNotification{
                        EmailAddress: "emailAddress",
                        Subject: "subject",
                        HtmlContent: fern.String(
                            "htmlContent",
                        ),
                    },
                },
                &fern.NotificationMethod{
                    Email: &fern.EmailNotification{
                        EmailAddress: "emailAddress",
                        Subject: "subject",
                        HtmlContent: fern.String(
                            "htmlContent",
                        ),
                    },
                },
            },
            OptionalMapOfEnums: map[string]fern.UserRole{
                "optionalMapOfEnums": fern.UserRoleAdmin,
            },
        },
    )
}
