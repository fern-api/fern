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
    request := &fern.UpdateUserRequest{
        Username: fern.String(
            "username",
        ),
        Email: fern.String(
            "email",
        ),
        Phone: fern.String(
            "phone",
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
    }
    client.NullableOptional.UpdateUser(
        context.TODO(),
        "userId",
        request,
    )
}
