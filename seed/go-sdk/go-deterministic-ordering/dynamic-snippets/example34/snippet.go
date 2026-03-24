package example

import (
    context "context"

    fern "github.com/go-deterministic-ordering/fern"
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    types "github.com/go-deterministic-ordering/fern/types"
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
    request := &types.ObjectWithDatetimeLikeString{
        DatetimeLikeString: "datetimeLikeString",
        ActualDatetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
    }
    client.Endpoints.Object.GetAndReturnWithDatetimeLikeString(
        context.TODO(),
        request,
    )
}
