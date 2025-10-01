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
    request := &fern.DeserializationTestRequest{
        RequiredString: "requiredString",
        NullableString: fern.String(
            "nullableString",
        ),
        OptionalString: fern.String(
            "optionalString",
        ),
        OptionalNullableString: fern.String(
            "optionalNullableString",
        ),
        NullableEnum: fern.UserRoleAdmin.Ptr(),
        OptionalEnum: fern.UserStatusActive.Ptr(),
        NullableUnion: &fern.NotificationMethod{
            Email: &fern.EmailNotification{
                EmailAddress: "emailAddress",
                Subject: "subject",
                HtmlContent: fern.String(
                    "htmlContent",
                ),
            },
        },
        OptionalUnion: &fern.SearchResult{
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
        NullableList: []string{
            "nullableList",
            "nullableList",
        },
        NullableMap: map[string]int{
            "nullableMap": 1,
        },
        NullableObject: &fern.Address{
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
        OptionalObject: &fern.Organization{
            Id: "id",
            Name: "name",
            Domain: fern.String(
                "domain",
            ),
            EmployeeCount: fern.Int(
                1,
            ),
        },
    }
    client.NullableOptional.TestDeserialization(
        context.TODO(),
        request,
    )
}
