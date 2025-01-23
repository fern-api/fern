package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    context "context"
    fern "github.com/pagination/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Users.ListWithGlobalConfig(
        context.TODO(),
        &fern.ListWithGlobalConfigRequest{
            Offset: fern.Int(
                1,
            ),
        },
    )
}
