package example

import (
    context "context"

    inhereplease "github.com/imdb/fern/inhereplease"
    client "github.com/imdb/fern/inhereplease/client"
    option "github.com/imdb/fern/inhereplease/option"
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
    request := &inhereplease.CreateMovieRequest{
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
