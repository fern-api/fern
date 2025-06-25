package example

import (
    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
    context "context"
    fern "github.com/unions/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Bigunion.Update(
        context.TODO(),
        &fern.BigUnion{
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
        },
    )
}
