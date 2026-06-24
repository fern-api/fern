package example

import (
    context "context"

    fern "github.com/go-nullable-date-ref/fern"
    client "github.com/go-nullable-date-ref/fern/client"
    option "github.com/go-nullable-date-ref/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Report{
        CreatedDate: fern.MustParseDate(
            "2023-01-15",
        ),
        FraudDate: fern.Time(
            fern.MustParseDate(
                "2023-01-15",
            ),
        ),
        ResolvedDate: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
        Description: fern.String(
            "description",
        ),
        Title: "title",
    }
    client.Reports.Create(
        context.TODO(),
        request,
    )
}
