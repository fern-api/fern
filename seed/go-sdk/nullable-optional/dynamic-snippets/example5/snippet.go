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
                HTMLContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        OptionalNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HTMLContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        OptionalNullableNotification: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HTMLContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        NullableSearchResult: &fern.SearchResult{
            User: &fern.UserResponse{
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
        OptionalSearchResult: &fern.SearchResult{
            User: &fern.UserResponse{
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
                BuildingID: fern.String(
                    "buildingId",
                ),
                TenantID: fern.String(
                    "tenantId",
                ),
            },
        },
        NullableListOfUnions: []*fern.NotificationMethod{
            &fern.NotificationMethod{
                Email: &fern.EmailNotification{
                    EmailAddress: "emailAddress",
                    Subject: "subject",
                    HTMLContent: fern.String(
                        "htmlContent",
                    ),
                },
            },
            &fern.NotificationMethod{
                Email: &fern.EmailNotification{
                    EmailAddress: "emailAddress",
                    Subject: "subject",
                    HTMLContent: fern.String(
                        "htmlContent",
                    ),
                },
            },
        },
        OptionalMapOfEnums: map[string]fern.UserRole{
            "optionalMapOfEnums": fern.UserRoleAdmin,
        },
    }
    client.NullableOptional.CreateComplexProfile(
        context.TODO(),
        request,
    )
}
