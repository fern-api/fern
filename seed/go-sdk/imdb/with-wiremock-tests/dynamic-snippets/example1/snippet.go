package example

import (
    context "context"
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
    client.Imdb.GetMovie(
        context.TODO(),
        "movieId",
    )
}
