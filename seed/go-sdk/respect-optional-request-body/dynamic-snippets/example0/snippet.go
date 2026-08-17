package example

import (
    context "context"

    fern "github.com/respect-optional-request-body/fern"
    client "github.com/respect-optional-request-body/fern/client"
    option "github.com/respect-optional-request-body/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.RefundBody{
        ID: "refund-id",
    }
    client.Refund(
        context.TODO(),
        request,
    )
}
