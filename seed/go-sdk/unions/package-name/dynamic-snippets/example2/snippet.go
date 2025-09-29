package example

import (
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
    unionsgo "github.com/fern-api/unions-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := []*unionsgo.BigUnion{
        &unionsgo.BigUnion{
            NormalSweet: &unionsgo.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: unionsgo.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: unionsgo.Time(
                unionsgo.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
        },
        &unionsgo.BigUnion{
            NormalSweet: &unionsgo.NormalSweet{
                Value: "value",
            },
            Id: "id",
            CreatedAt: unionsgo.MustParseDateTime(
                "2024-01-15T09:30:00Z",
            ),
            ArchivedAt: unionsgo.Time(
                unionsgo.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
            ),
        },
    }
    client.Bigunion.UpdateMany(
        context.TODO(),
        request,
    )
}
