package example

import (
    context "context"

    client "github.com/bearer-token-environment-variable/fern/client"
    option "github.com/bearer-token-environment-variable/fern/option"
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
    client.Service.Getwithbearertoken(
        context.TODO(),
    )
}
