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
    request := &fern.RequiredRefundRequest{
        ID: "refund-id",
        Body: &fern.RefundRequest{
            Amount: fern.Float64(
                60,
            ),
        },
    }
    err := client.RequiredRefund(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
