package example

import (
    context "context"
    fern "github.com/validation/fern"
    client "github.com/validation/fern/client"
    option "github.com/validation/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetRequest{
        Decimal: 2.2,
        Even: 100,
        Name: "fern",
    }
    client.Get(
        context.TODO(),
        request,
    )
}
