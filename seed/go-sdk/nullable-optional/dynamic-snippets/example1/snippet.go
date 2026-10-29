package example

import (
    context "context"

    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateUserRequest{
        Username: "username",
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
            BuildingID: fern.String(
                "buildingId",
            ),
            TenantID: fern.String(
                "tenantId",
            ),
        },
    }
    _, err := client.NullableOptional.CreateUser(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
