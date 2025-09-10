package example

import (
    client "github.com/single-url-environment-no-default/fern/client"
    option "github.com/single-url-environment-no-default/fern/option"
    context "context"
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
