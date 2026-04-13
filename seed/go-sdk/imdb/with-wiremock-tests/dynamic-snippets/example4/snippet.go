package example

import (
    context "context"

    testPackageName "github.com/imdb/fern"
    client "github.com/imdb/fern/client"
    option "github.com/imdb/fern/option"
)

func do() {
    client := client.NewIMDBClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &testPackageName.ImdbGetMovieRequest{
        MovieID: "movieId",
    }
    client.Imdb.Getmovie(
        context.TODO(),
        request,
    )
}
