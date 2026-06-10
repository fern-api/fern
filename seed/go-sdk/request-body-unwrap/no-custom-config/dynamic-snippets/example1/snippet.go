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
    request := &fern.CreatePaymentRequest{
        Data: &fern.CreatePaymentRequestData{
            ID: fern.String(
                "id",
            ),
            Type: fern.CreatePaymentRequestDataTypePayment,
            Attributes: &fern.CreatePaymentRequestDataAttributes{
                Amount: 1,
                Currency: "currency",
                Description: fern.String(
                    "description",
                ),
            },
        },
    }
    client.Payment.CreatePayment(
        context.TODO(),
        request,
    )
}
