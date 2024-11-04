package example

import (
    client "github.com/idempotency-headers/fern/client"
    option "github.com/idempotency-headers/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Payment.Delete(
        context.TODO(),
        "paymentId",
    )
}
