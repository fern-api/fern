package example

import (
    context "context"

    fern "github.com/examples/fern"
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewAcme(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.Movie{
        ID: "id",
        Prequel: fern.String(
            "prequel",
        ),
        Title: "title",
        From: "from",
        Rating: 1.1,
        Tag: "tag",
        Book: fern.String(
            "book",
        ),
        Metadata: map[string]any{
            "metadata": map[string]any{
                "key": "value",
            },
        },
        Revenue: int64(1000000),
    }
    _, err := client.Service.CreateMovie(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
