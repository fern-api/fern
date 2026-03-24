package example

import (
    context "context"

    fern "github.com/unions/fern"
    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.BigUnion{
        NormalSweet: &fern.NormalSweet{
            Value: "value",
        },
        Id: "id",
        CreatedAt: fern.MustParseDateTime(
            "2024-01-15T09:30:00Z",
        ),
        ArchivedAt: fern.Time(
            fern.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
        ),
    }
    client.Bigunion.Update(
        context.TODO(),
        request,
    )
}
