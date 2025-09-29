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
    request := &fern.FilterByRoleRequest{
        Role: fern.UserRoleAdmin.Ptr(),
        Status: fern.UserStatusActive.Ptr(),
        SecondaryRole: fern.UserRoleAdmin.Ptr(),
    }
    client.NullableOptional.FilterByRole(
        context.TODO(),
        request,
    )
}
