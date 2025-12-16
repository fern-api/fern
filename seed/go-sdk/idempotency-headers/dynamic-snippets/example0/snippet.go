package example

import (
    client "github.com/idempotency-headers/fern/client"
    option "github.com/idempotency-headers/fern/option"
    fern "github.com/idempotency-headers/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.CreatePaymentRequest{
        Amount: 1,
        Currency: fern.CurrencyUsd,
    }
    client.Payment.Create(
        context.TODO(),
        request,
    )
}
