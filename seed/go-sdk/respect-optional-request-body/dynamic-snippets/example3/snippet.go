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
    request := &fern.RequiredRefundRequest{
        ID: "id",
        Body: &fern.RefundRequest{
            Amount: fern.Float64(
                1.1,
            ),
        },
    }
    client.RequiredRefund(
        context.TODO(),
        request,
    )
}
