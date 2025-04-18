package example

import (
    client "github.com/examples-minimal/fern/client"
    option "github.com/examples-minimal/fern/option"
    context "context"
    fern "github.com/examples-minimal/fern"
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
    client.Service.CreateBigEntity(
        context.TODO(),
        &fern.Test{
            U: map[string]string{
                "u": "u",
            },
            V: []string{
                "v",
            },
        },
    )
}
