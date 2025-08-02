package example

import (
    client "github.com/reserved-keywords/fern/client"
    option "github.com/reserved-keywords/fern/option"
    context "context"
    fern "github.com/reserved-keywords/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Package.Test(
        context.TODO(),
        &fern.TestRequest{
            For: "for",
        },
    )
}
