package example

import (
    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
    context "context"
    fern "github.com/client-side-params/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Service.GetUserById(
        context.TODO(),
        "userId",
        &fern.GetUserRequest{
            Fields: fern.String(
                "fields",
            ),
            IncludeFields: fern.Bool(
                true,
            ),
        },
    )
}
