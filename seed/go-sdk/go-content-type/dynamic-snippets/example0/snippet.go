package example

import (
    context "context"

    fern "github.com/go-content-type/fern"
    client "github.com/go-content-type/fern/client"
    option "github.com/go-content-type/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.CreateMovieRequest{
        Title: "title",
        Rating: 1.1,
    }
    _, err := client.Imdb.CreateMovie(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
