package example

import (
    context "context"

    fern "github.com/inline-enum-type-name-override/fern"
    client "github.com/inline-enum-type-name-override/fern/client"
    option "github.com/inline-enum-type-name-override/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.LoadRequest{}
    client.Reporting.Load(
        context.TODO(),
        request,
    )
}
