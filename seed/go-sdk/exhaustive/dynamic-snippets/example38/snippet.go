package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    uuid "github.com/google/uuid"
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
    request := uuid.MustParse(
        "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    )
    client.Endpoints.Primitive.GetAndReturnUuid(
        context.TODO(),
        request,
    )
}
