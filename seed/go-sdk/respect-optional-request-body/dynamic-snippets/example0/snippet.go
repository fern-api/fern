package example

import (
    context "context"

    fern "github.com/respect-optional-request-body/fern"
    client "github.com/respect-optional-request-body/fern/client"
    option "github.com/respect-optional-request-body/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.RefundBody{
        ID: "refund-id",
    }
    err := client.Refund(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
