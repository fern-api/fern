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
            "2024-01-15T09:30:00Z",
        ),
        DatetimeAlias: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        OptionalDatetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        OptionalDatetimeAlias: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
    }
    client.Endpoints.GetAndReturnWithDatetimeAliasWithDocs(
        context.TODO(),
        request,
    )
}
