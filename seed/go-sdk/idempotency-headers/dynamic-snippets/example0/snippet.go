package example

import (
    client "github.com/idempotency-headers/fern/client"
    option "github.com/idempotency-headers/fern/option"
    context "context"
    fern "github.com/idempotency-headers/fern"
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
    client.Payment.Create(
        context.TODO(),
        &fern.CreatePaymentRequest{
            Amount: 1,
            Currency: fern.CurrencyUsd,
        },
    )
}
