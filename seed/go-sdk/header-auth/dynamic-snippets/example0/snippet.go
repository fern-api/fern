package example

import (
    client "github.com/header-auth/fern/client"
    option "github.com/header-auth/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithHeaderTokenAuth(
            "<value>",
        ),
    )
    client.Service.GetWithBearerToken(
        context.TODO(),
    )
}
