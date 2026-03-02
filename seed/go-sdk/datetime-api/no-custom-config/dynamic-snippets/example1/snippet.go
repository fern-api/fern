package example

import (
    client "github.com/datetime-api/fern/client"
    option "github.com/datetime-api/fern/option"
    fern "github.com/datetime-api/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ObjectWithDatetimeAlias{
        DateTime: fern.MustParseDateTime(
            "2023-08-31T14:15:22Z",
        ),
    }
    client.Endpoints.GetAndReturnWithDatetimeAliasWithDocs(
        context.TODO(),
        request,
    )
}
