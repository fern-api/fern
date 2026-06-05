package example

import (
    context "context"

    fern "github.com/request-body-unwrap/fern"
    client "github.com/request-body-unwrap/fern/client"
    option "github.com/request-body-unwrap/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetPaymentRequest{
        PaymentID: "payment_id",
    }
    client.Payment.GetPayment(
        context.TODO(),
        request,
    )
}
