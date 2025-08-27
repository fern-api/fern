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
    client.NullableOptional.UpdateUser(
        context.TODO(),
        "userId",
        &fern.UpdateUserRequest{
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
            },
        },
    )
}
