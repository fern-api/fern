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
    client.NullableOptional.FilterByRole(
        context.TODO(),
        &fern.FilterByRoleRequest{
            Role: fern.UserRoleAdmin.Ptr(),
            Status: fern.UserStatusActive.Ptr(),
            SecondaryRole: fern.UserRoleAdmin.Ptr(),
        },
    )
}
