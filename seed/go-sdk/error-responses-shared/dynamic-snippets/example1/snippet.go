package example

import (
    context "context"

    client "github.com/error-responses-shared/fern/client"
    option "github.com/error-responses-shared/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Calls.Calls.CreateCall(
        context.TODO(),
    )
}
