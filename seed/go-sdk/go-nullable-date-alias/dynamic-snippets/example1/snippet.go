package example

import (
    context "context"

    fern "github.com/go-nullable-date-alias/fern"
    client "github.com/go-nullable-date-alias/fern/client"
    option "github.com/go-nullable-date-alias/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Report{
        ID: "id",
        FraudDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        CreatedAt: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Memo: fern.String(
            "memo",
        ),
        InlineDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        InlineDatetime: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
    }
    client.Reports.Create(
        context.TODO(),
        request,
    )
}
