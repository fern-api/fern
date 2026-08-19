package example

import (
    context "context"

    inhereplease "github.com/imdb/fern/inhereplease"
    client "github.com/imdb/fern/inhereplease/client"
    option "github.com/imdb/fern/inhereplease/option"
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
    request := &inhereplease.GetMovieImdbRequest{
        MovieID: "movieId",
    }
    client.Imdb.GetMovie(
        context.TODO(),
        request,
    )
}
