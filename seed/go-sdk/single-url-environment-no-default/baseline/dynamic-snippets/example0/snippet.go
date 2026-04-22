package example

import (
    context "context"

    client "github.com/single-url-environment-no-default/fern/client"
    option "github.com/single-url-environment-no-default/fern/option"
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
    client.Dummy.GetDummy(
        context.TODO(),
    )
}
