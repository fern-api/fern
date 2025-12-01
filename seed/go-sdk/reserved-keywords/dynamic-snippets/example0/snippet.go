package example

import (
    client "github.com/reserved-keywords/fern/client"
    option "github.com/reserved-keywords/fern/option"
    fern "github.com/reserved-keywords/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.TestRequest{
        For: "for",
    }
    client.Package.Test(
        context.TODO(),
        request,
    )
}
