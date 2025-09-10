package example

import (
    client "github.com/nullable/fern/client"
    option "github.com/nullable/fern/option"
    context "context"
    fern "github.com/nullable/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Nullable.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Username: "username",
            Tags: []string{
                "tags",
                "tags",
            },
            Metadata: &fern.Metadata{
                CreatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                UpdatedAt: fern.MustParseDateTime(
                    "2024-01-15T09:30:00Z",
                ),
                Avatar: fern.String(
                    "avatar",
                ),
                Activated: fern.Bool(
                    true,
                ),
                Status: &fern.Status{
                    Active: "active",
                },
                Values: map[string]*string{
                    "values": fern.String(
                        "values",
                    ),
                },
            },
            Avatar: fern.String(
                "avatar",
            ),
        },
    )
}
