package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
    fern "github.com/exhaustive/fern"
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
    request := &types.ObjectWithDatetimeLikeString{
        DatetimeLikeString: "2023-08-31T14:15:22Z",
        ActualDatetime: fern.MustParseDateTime(
            "2023-08-31T14:15:22Z",
        ),
    }
    client.Endpoints.Object.GetAndReturnWithDatetimeLikeString(
        context.TODO(),
        request,
    )
}
