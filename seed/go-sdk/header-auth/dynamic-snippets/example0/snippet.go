package example

import (
    context "context"

    client "github.com/header-auth/fern/client"
    option "github.com/header-auth/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithHeaderTokenAuth(
            "YOUR_API_KEY",
        ),
    )
    client.Service.GetWithBearerToken(
        context.TODO(),
    )
}
