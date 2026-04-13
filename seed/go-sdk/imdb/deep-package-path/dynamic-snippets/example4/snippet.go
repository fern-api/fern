package example

import (
    context "context"

    please "github.com/imdb/fern/all/the/way/in/here/please"
    client "github.com/imdb/fern/all/the/way/in/here/please/client"
    option "github.com/imdb/fern/all/the/way/in/here/please/option"
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
    request := &please.ImdbGetMovieRequest{
        MovieID: "movieId",
    }
    client.Imdb.Getmovie(
        context.TODO(),
        request,
    )
}
