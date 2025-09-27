package example

import (
    client "github.com/imdb/fern/inhereplease/client"
    option "github.com/imdb/fern/inhereplease/option"
    inhereplease "github.com/imdb/fern/inhereplease"
    context "context"
)

func do() {
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
    client.Imdb.CreateMovie(
        context.TODO(),
        request,
    )
}
