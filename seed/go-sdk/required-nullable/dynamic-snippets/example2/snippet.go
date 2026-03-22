package example

import (
    context "context"
    fern "github.com/required-nullable/fern"
    client "github.com/required-nullable/fern/client"
    option "github.com/required-nullable/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UpdateFooRequest{
        XIdempotencyKey: "X-Idempotency-Key",
        NullableText: fern.String(
            "nullable_text",
        ),
        NullableNumber: fern.Float64(
            1.1,
        ),
        NonNullableText: fern.String(
            "non_nullable_text",
        ),
    }
    client.UpdateFoo(
        context.TODO(),
        "id",
        request,
    )
}
