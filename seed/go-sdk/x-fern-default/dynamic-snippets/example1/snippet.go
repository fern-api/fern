package example

import (
    context "context"

    fern "github.com/x-fern-default/fern"
    client "github.com/x-fern-default/fern/client"
    option "github.com/x-fern-default/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TestGetRequest{
        Region: "region",
        Limit: fern.String(
            "100",
        ),
    }
    client.TestGet(
        context.TODO(),
        request,
    )
}
