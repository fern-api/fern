package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
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
    request := &fern.TypesObjectWithDatetimeLikeString{
        DatetimeLikeString: "datetimeLikeString",
        ActualDatetime: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
    }
    client.EndpointsObject.EndpointsObjectGetAndReturnWithDatetimeLikeString(
        context.TODO(),
        request,
    )
}
