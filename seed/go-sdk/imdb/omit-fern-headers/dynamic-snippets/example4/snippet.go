package example

import (
    context "context"

    fern "github.com/imdb/fern"
    client "github.com/imdb/fern/client"
    option "github.com/imdb/fern/option"
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
    request := &fern.ImdbGetMovieRequest{
        MovieID: "movieId",
    }
    client.Imdb.Getmovie(
        context.TODO(),
        request,
    )
}
