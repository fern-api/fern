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
    request := &fern.NullableOptionalFilterByRoleRequest{
        Role: fern.UserRoleAdmin,
        Status: fern.UserStatusActive.Ptr(),
        SecondaryRole: fern.UserRoleAdmin.Ptr(),
    }
    client.Nullableoptional.Filterbyrole(
        context.TODO(),
        request,
    )
}
