package example

import (
    context "context"

    client "github.com/go-multi-env-url-templating/fern/client"
    option "github.com/go-multi-env-url-templating/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Things.ListThings(
        context.TODO(),
    )
}
