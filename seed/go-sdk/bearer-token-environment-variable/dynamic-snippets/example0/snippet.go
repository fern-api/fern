package example

import (
    client "github.com/bearer-token-environment-variable/fern/client"
    option "github.com/bearer-token-environment-variable/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithApiKey(
            "<token>",
        ),
    )
    client.Service.GetWithBearerToken(
        context.TODO(),
    )
}
