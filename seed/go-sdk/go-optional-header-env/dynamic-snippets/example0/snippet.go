package example

import (
    context "context"

    client "github.com/go-optional-header-env/fern/client"
    option "github.com/go-optional-header-env/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
            "<token>",
        ),
    )
    client.Service.GetWithAPIVersion(
        context.TODO(),
    )
}
