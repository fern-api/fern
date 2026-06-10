package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
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
    request := &types.ObjectWithMalformedDatetimeExample{
        DatetimeField: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        StringField: "stringField",
    }
    client.Endpoints.Object.GetAndReturnWithMalformedDatetime(
        context.TODO(),
        request,
    )
}
